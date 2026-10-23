/**
 * Wikidata sources for auditable prompts.
 *
 * Each query must return these variables:
 *   ?item        the entity URI (the QID is read from it)
 *   ?itemLabel   the English label
 *   ?sitelinks   the number of Wikimedia sitelinks
 *   ?aliases     a pipe-separated GROUP_CONCAT of English aliases
 *
 * Add a prompt only after checking the class/search candidates it relies on.
 */
export const SOURCES = {
  'jupiter-moon': {
    sparql: `
SELECT ?item ?itemLabel ?sitelinks
       (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?item wdt:P397 wd:Q319 .
  ?item wdt:P31/wdt:P279* wd:Q2537 .
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL {
    ?item skos:altLabel ?alias .
    FILTER(LANG(?alias) = "en")
  }
}
GROUP BY ?item ?itemLabel ?sitelinks
ORDER BY DESC(?sitelinks) ?item
`.trim(),
  },
  'greek-god': {
    sparql: `
SELECT ?item ?itemLabel ?sitelinks
       (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q22989102 .
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL {
    ?item skos:altLabel ?alias .
    FILTER(LANG(?alias) = "en")
  }
}
GROUP BY ?item ?itemLabel ?sitelinks
ORDER BY DESC(?sitelinks) ?item
`.trim(),
  },
  'chemical-element': {
    sparql: `
SELECT ?item ?itemLabel ?sitelinks
       (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?item wdt:P31 wd:Q11344 .
  ?item wdt:P1086 ?atomicNumber .
  FILTER(?atomicNumber >= 1 && ?atomicNumber <= 118)
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL {
    ?item skos:altLabel ?alias .
    FILTER(LANG(?alias) = "en")
  }
}
GROUP BY ?item ?itemLabel ?sitelinks
ORDER BY DESC(?sitelinks) ?item
`.trim(),
  },
  moon: {
    sparql: `
SELECT ?item ?itemLabel ?sitelinks
       (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q2537 .
  ?item wdt:P397 ?parentBody .
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL {
    ?item skos:altLabel ?alias .
    FILTER(LANG(?alias) = "en")
  }
}
GROUP BY ?item ?itemLabel ?sitelinks
ORDER BY DESC(?sitelinks) ?item
`.trim(),
  },
  'us-state': {
    sparql: `
SELECT ?item ?itemLabel ?sitelinks
       (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?item wdt:P31/wdt:P279* wd:Q35657 .
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL {
    ?item skos:altLabel ?alias .
    FILTER(LANG(?alias) = "en")
  }
}
GROUP BY ?item ?itemLabel ?sitelinks
ORDER BY DESC(?sitelinks) ?item
`.trim(),
  },
  'country-europe': {
    sparql: `
SELECT ?item ?itemLabel ?sitelinks
       (GROUP_CONCAT(DISTINCT ?alias; separator="|") AS ?aliases)
WHERE {
  ?item wdt:P31 wd:Q6256 .
  ?item wdt:P30 wd:Q46 .
  ?item rdfs:label ?itemLabel .
  FILTER(LANG(?itemLabel) = "en")
  ?item wikibase:sitelinks ?sitelinks .
  OPTIONAL {
    ?item skos:altLabel ?alias .
    FILTER(LANG(?alias) = "en")
  }
}
GROUP BY ?item ?itemLabel ?sitelinks
ORDER BY DESC(?sitelinks) ?item
`.trim(),
  },
};
