// Client-side diagnostics: captures uncaught errors, unhandled rejections,
// console.error calls, and failed fetch responses. Mirrors them to the
// Lovable error reporter and exposes a ring buffer at window.__diagnostics.

import { reportLovableError } from "./lovable-error-reporting";

type DiagEntry = {
  ts: number;
  kind: "error" | "unhandledrejection" | "console" | "fetch";
  message: string;
  detail?: unknown;
  url?: string;
};

const BUFFER: DiagEntry[] = [];
const MAX = 200;

function push(entry: DiagEntry) {
  BUFFER.push(entry);
  if (BUFFER.length > MAX) BUFFER.shift();
}

function fmt(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

let installed = false;

export function installClientDiagnostics() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    const err = event.error ?? new Error(event.message);
    push({
      ts: Date.now(),
      kind: "error",
      message: fmt(err),
      url: `${event.filename}:${event.lineno}:${event.colno}`,
    });
    // eslint-disable-next-line no-console
    console.error("[diagnostics] window.error", err);
    reportLovableError(err, { source: "window.onerror", filename: event.filename });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    push({ ts: Date.now(), kind: "unhandledrejection", message: fmt(reason) });
    // eslint-disable-next-line no-console
    console.error("[diagnostics] unhandledrejection", reason);
    reportLovableError(reason instanceof Error ? reason : new Error(fmt(reason)), {
      source: "unhandledrejection",
    });
  });

  // Wrap console.error to retain a record
  const origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    push({ ts: Date.now(), kind: "console", message: args.map(fmt).join(" ") });
    origError(...args);
  };

  // Wrap fetch to surface HTTP failures
  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    try {
      const res = await origFetch(input as RequestInfo, init);
      if (!res.ok) {
        push({
          ts: Date.now(),
          kind: "fetch",
          message: `${res.status} ${res.statusText} ${url}`,
          url,
        });
        // eslint-disable-next-line no-console
        console.error("[diagnostics] fetch failed", res.status, url);
      }
      return res;
    } catch (err) {
      push({ ts: Date.now(), kind: "fetch", message: `network error ${url}: ${fmt(err)}`, url });
      // eslint-disable-next-line no-console
      console.error("[diagnostics] fetch threw", url, err);
      throw err;
    }
  };

  (window as unknown as { __diagnostics: { entries: () => DiagEntry[]; clear: () => void } }).__diagnostics = {
    entries: () => [...BUFFER],
    clear: () => {
      BUFFER.length = 0;
    },
  };

  // eslint-disable-next-line no-console
  console.info("[diagnostics] installed — inspect via window.__diagnostics.entries()");
}
