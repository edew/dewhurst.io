import { useCallback, useSyncExternalStore } from "react";

// One search parameter of the page's URL, as state. Setting it pushes a
// history entry; removing it replaces the current one.

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function navigate(change: (params: URLSearchParams) => void, replace: boolean) {
  const url = new URL(window.location.href);

  change(url.searchParams);
  history[replace ? "replaceState" : "pushState"](null, "", url);
  listeners.forEach((listener) => listener());
}

export function useSearchParam(name: string) {
  // The page is prerendered without search params, so the server snapshot is
  // empty, and hydration reads the real value just after.
  const value = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name) ?? "",
    () => "",
  );
  const set = useCallback(
    (next: string) => navigate((params) => params.set(name, next), false),
    [name],
  );
  const remove = useCallback(
    () => navigate((params) => params.delete(name), true),
    [name],
  );

  return [value, set, remove] as const;
}
