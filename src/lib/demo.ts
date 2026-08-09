import { useEffect, useState } from "react";

const KEY = "esb.demoMode";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  return v === null ? true : v === "1"; // unlocked by default (mock/demo)
}

export function setDemoMode(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
  window.dispatchEvent(new CustomEvent("esb-demo-mode", { detail: on }));
}

/** Reactive demo-mode flag. SSR-safe: starts false, syncs after hydration. */
export function useDemoMode(): [boolean, (on: boolean) => void, boolean] {
  const [state, setState] = useState({ on: false, hydrated: false });

  useEffect(() => {
    setState({ on: isDemoMode(), hydrated: true });
    const handler = (e: Event) =>
      setState({ on: (e as CustomEvent<boolean>).detail, hydrated: true });
    window.addEventListener("esb-demo-mode", handler);
    return () => window.removeEventListener("esb-demo-mode", handler);
  }, []);

  return [
    state.on,
    (next: boolean) => { setDemoMode(next); setState({ on: next, hydrated: true }); },
    state.hydrated,
  ];
}

