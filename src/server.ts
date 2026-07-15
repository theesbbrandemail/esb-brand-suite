import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack.react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function readResponsePrefix(response: Response, maxBytes = 4096): Promise<string> {
  // Try to read at most `maxBytes` from the body stream to avoid buffering large responses.
  try {
    const body = response.clone().body;
    if (!body || typeof (body as any).getReader !== 'function') {
      // Fallback: no body stream available, read full text (should be rare)
      return await response.clone().text();
    }

    const reader = (body as any).getReader();
    const decoder = new TextDecoder();
    let received = '';
    let total = 0;

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      received += chunk;
      total += (value && value.byteLength) || chunk.length;
      if (total >= maxBytes) break;
    }

    return received;
  } catch (err) {
    // If anything goes wrong, avoid throwing and let caller treat as unknown body
    return '';
  }
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  // Check content-length header first and avoid reading if very large
  const contentLengthHeader = response.headers.get('content-length');
  if (contentLengthHeader) {
    const len = parseInt(contentLengthHeader, 10);
    if (!Number.isNaN(len) && len > 16_384) {
      // Too large to safely inspect
      console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed large SSR error response (length=${len})`));
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  }

  const body = await readResponsePrefix(response, 4096);
  if (!body || (!body.includes('\"unhandled\":true') && !body.includes('\"message\":\"HTTPError\"'))) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
