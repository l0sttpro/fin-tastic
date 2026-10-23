import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

function publicFile(name: string): URL {
  return new URL(`../public/${name}`, import.meta.url);
}

function pngSize(name: string): { width: number; height: number } {
  const buffer = readFileSync(publicFile(name));
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG', `${name} is not a PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test('favicons, Apple touch icon and web manifest are wired up', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /<link rel="icon" href="\.\/favicon\.ico"[^>]*>/);
  assert.match(html, /<link rel="icon" href="\.\/favicon-16x16\.png"[^>]*>/);
  assert.match(html, /<link rel="icon" href="\.\/favicon-32x32\.png"[^>]*>/);
  assert.match(html, /<link rel="icon" href="\.\/favicon\.svg" type="image\/svg\+xml"[^>]*>/);
  assert.match(
    html,
    /<link rel="apple-touch-icon" href="\.\/apple-touch-icon\.png" sizes="180x180"[^>]*>/,
  );
  assert.match(html, /<link rel="manifest" href="\.\/site\.webmanifest"[^>]*>/);
  assert.match(html, /<meta name="apple-mobile-web-app-title" content="Fin-tastic"[^>]*>/);

  for (const asset of [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.svg',
    'apple-touch-icon.png',
    'site.webmanifest',
    'icon-192.png',
    'icon-512.png',
  ]) {
    assert.ok(existsSync(publicFile(asset)), `${asset} is missing from public/`);
  }

  const svg = readFileSync(publicFile('favicon.svg'), 'utf8');
  assert.match(svg, /<svg[^>]*viewBox="0 0 512 512"/);
  assert.deepEqual(pngSize('apple-touch-icon.png'), { width: 180, height: 180 });

  const manifest = JSON.parse(readFileSync(publicFile('site.webmanifest'), 'utf8')) as {
    start_url: string;
    scope: string;
    icons: Array<{ src: string; sizes: string; type: string }>;
  };

  // Relative URLs keep the install metadata working under the GitHub Pages
  // project path as well as a domain root.
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.icons.length, 2);

  for (const icon of manifest.icons) {
    assert.match(icon.src, /^\.\/icon-(192|512)\.png$/);
    assert.equal(icon.type, 'image/png');
    const size = pngSize(icon.src.slice(2));
    assert.equal(icon.sizes, `${size.width}x${size.height}`);
  }
});
