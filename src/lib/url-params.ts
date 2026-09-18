// Small shared helpers for syncing page state to the URL's query string.
// Each page builds its own params object and calls these directly rather
// than going through a generic "useUrlState" abstraction — every page's
// state shapes differ enough (a Set, a validated enum, a looked-up object)
// that a one-size-fits-all API would obscure more than it saves.

/** Builds a query string from a `{ [param]: value }` map, omitting any
 * param whose value is null/undefined/empty (so default-state URLs stay
 * clean, e.g. plain "/pins/" rather than "/pins/?view=map&arrange=name"). */
export function buildSearch(params: Record<string, string | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return search.toString();
}

/** True if the given params, once built into a query string, are already
 * equivalent to the current search string — used to skip redundant history
 * updates and to break write/read-back feedback loops. Compares parsed
 * key/value pairs (via URLSearchParams) rather than raw strings, so this
 * isn't fooled by encoding differences (e.g. "%20" vs "+") or param order. */
export function searchMatches(currentSearch: string, params: Record<string, string | null | undefined>): boolean {
  const normalize = (search: string) => [...new URLSearchParams(search).entries()].sort(([a], [b]) => a.localeCompare(b));
  const current = normalize(currentSearch);
  const target = normalize(buildSearch(params));
  return current.length === target.length && current.every(([key, value], index) => key === target[index][0] && value === target[index][1]);
}
