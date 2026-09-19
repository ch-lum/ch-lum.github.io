import { untrack } from 'svelte';
import { browser } from '$app/environment';
import { afterNavigate, pushState, replaceState } from '$app/navigation';
import { buildSearch, searchMatches, type SearchParams } from '$lib/url-params';

/** The query params present when the page first loaded, for hydrating
 * initial state so a deep link restores exactly that view. Guarded by
 * `browser`, since component init also runs during prerendering, where
 * `location` doesn't exist — the prerendered HTML just reflects defaults,
 * and hydration picks up the real query string an instant later. */
export function initialSearchParams() {
  return new URLSearchParams(browser ? location.search : '');
}

type UrlSyncOptions = {
  /** The query params describing the current state; null/empty values are
   * omitted, so default state keeps a clean URL. */
  params: () => SearchParams;
  /** What deserves its own history entry — e.g. the open modal's id, or the
   * current short-form entry. Whenever this changes to a new non-null value,
   * a history entry is pushed so Back returns to the previous state. When it
   * changes back to null (a modal closing via ×/Escape/backdrop), the entry
   * pushed for it is popped, just as Back would. Every other change (sorting,
   * filtering, tidying an invalid param on load) replaces the current entry,
   * so the URL stays accurate without spamming Back. */
  entry: () => string | null;
  /** Reads state back from the URL after Back/Forward navigation. */
  restore: (params: URLSearchParams) => void;
};

/**
 * Keeps page state and the URL query string in sync, both ways. Must be
 * called during component initialisation.
 *
 * Implementation notes, each learned the hard way:
 * - SvelteKit's pushState/replaceState must not be called before its router
 *   has started, and during hydration a component's first effects run
 *   before that point (the dev build throws a clear "router is initialized"
 *   error; the production build fails deeper inside SvelteKit with a
 *   TypeError, and leaves its history bookkeeping half-done). afterNavigate
 *   fires once the router is ready — on initial load and on client-side
 *   navigation alike — so nothing is written until then.
 * - The current URL is read from `location`, not `page.url` from
 *   `$app/state`: after a Back-then-Forward sequence through our own
 *   shallow-routed history entries, `page.url` doesn't always resync, which
 *   once caused the write-out to "correct" the URL using stale data right
 *   after Forward navigation. `location` is always accurate and isn't
 *   reactive.
 * - SvelteKit's pushState/replaceState read `page.url` internally, and
 *   `page.url` *is* reactive — so those calls are wrapped in `untrack`.
 *   Without it the write-out silently depends on `page.url` and re-runs,
 *   with stale local state, the moment SvelteKit's popstate handler updates
 *   it (before our own popstate listener has synced state from the URL),
 *   writing a just-closed modal's URL back onto the entry Back returned to.
 * - Reading back uses a native `popstate` listener rather than an effect
 *   watching `page.url`: `popstate` only fires for genuine Back/Forward,
 *   never for our own pushState/replaceState calls, so it can't race the
 *   write-out.
 */
export function syncUrl({ params, entry, restore }: UrlSyncOptions) {
  // Write-out bookkeeping — deliberately plain variables, not `$state`, since
  // they track what was last synced rather than driving any UI.
  // `previousEntry` starts as the deep-linked entry, if any, so a mount-time
  // URL clean-up never pushes. `entryPushed` records that the current entry
  // got its own history entry, so clearing it can pop that entry again
  // instead of leaving a dead duplicate behind that makes Back a no-op.
  let previousEntry = untrack(entry);
  let entryPushed = false;
  let urlReady = $state(false);
  afterNavigate(() => { urlReady = true; });

  $effect(() => {
    if (!urlReady) return;
    const nextParams = params();
    const currentEntry = entry();
    const lastEntry = previousEntry;
    previousEntry = currentEntry;
    if (searchMatches(location.search, nextParams)) return;
    if (currentEntry === null && lastEntry !== null && entryPushed) {
      entryPushed = false;
      history.back();
      return;
    }
    const search = buildSearch(nextParams);
    const url = `${location.pathname}${search ? `?${search}` : ''}`;
    if (currentEntry !== null && currentEntry !== lastEntry) {
      untrack(() => pushState(url, {}));
      entryPushed = true;
    } else {
      untrack(() => replaceState(url, {}));
    }
  });

  $effect(() => {
    const onPopState = () => restore(new URLSearchParams(location.search));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  });
}
