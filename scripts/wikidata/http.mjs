import { setTimeout as sleep } from 'node:timers/promises';

/** Identify this tool to Wikidata, as their API etiquette requires. */
export const USER_AGENT = 'fin-tastic-audit/1.0 (personal project)';

/** Wikidata asks clients to make at most one request per second. */
const MIN_REQUEST_INTERVAL_MS = 1000;
const MAX_ATTEMPTS = 5;
const REQUEST_TIMEOUT_MS = 60_000;

let lastRequestStartedAt = 0;

async function waitForRequestSlot() {
  const elapsed = Date.now() - lastRequestStartedAt;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
  }
  lastRequestStartedAt = Date.now();
}

function retryDelayMs(attempt, retryAfterHeader) {
  const retryAfter = Number(retryAfterHeader);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return retryAfter * 1000;
  }
  return Math.min(30_000, 1000 * 2 ** (attempt - 1));
}

/**
 * Fetch JSON from a Wikimedia endpoint with a polite User-Agent, one request
 * per second, and retries for rate limits and transient server failures.
 */
export async function requestJson(url, { accept = 'application/json' } = {}) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await waitForRequestSlot();

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: accept,
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw error;
      const delay = retryDelayMs(attempt);
      console.warn(`Request failed (${error.message}); retrying in ${delay}ms…`);
      await sleep(delay);
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`Wikidata returned ${response.status} after ${MAX_ATTEMPTS} attempts`);
      }
      const delay = retryDelayMs(attempt, response.headers.get('retry-after'));
      console.warn(`Wikidata returned ${response.status}; retrying in ${delay}ms…`);
      await sleep(delay);
      continue;
    }

    const body = await response.text();
    throw new Error(`Wikidata request failed (${response.status} ${response.statusText}):\n${body}`);
  }

  throw new Error('Wikidata request failed without a response');
}
