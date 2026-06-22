// Server-only Lovable AI Gateway helper with retry, backoff, and typed errors.
const BASE = "https://ai.gateway.lovable.dev/v1";

export type AIGatewayErrorCode =
  | "missing_key"
  | "rate_limited"
  | "credits_exhausted"
  | "bad_request"
  | "unauthorized"
  | "server_error"
  | "timeout"
  | "network"
  | "unknown";

export class AIGatewayError extends Error {
  code: AIGatewayErrorCode;
  status?: number;
  retryAfterMs?: number;
  userMessage: string;
  constructor(opts: {
    code: AIGatewayErrorCode;
    message: string;
    userMessage: string;
    status?: number;
    retryAfterMs?: number;
  }) {
    super(opts.message);
    this.name = "AIGatewayError";
    this.code = opts.code;
    this.status = opts.status;
    this.retryAfterMs = opts.retryAfterMs;
    this.userMessage = opts.userMessage;
  }
}

function parseRetryAfter(h: string | null): number | undefined {
  if (!h) return undefined;
  const n = Number(h);
  if (Number.isFinite(n)) return Math.max(0, n * 1000);
  const date = Date.parse(h);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

function classify(status: number, body: string, retryAfter?: number): AIGatewayError {
  if (status === 401 || status === 403) {
    return new AIGatewayError({
      code: "unauthorized",
      status,
      message: `AI Gateway ${status}: ${body}`,
      userMessage: "AI service authorization failed. Please contact support.",
    });
  }
  if (status === 429) {
    return new AIGatewayError({
      code: "rate_limited",
      status,
      retryAfterMs: retryAfter,
      message: `AI Gateway 429: ${body}`,
      userMessage: "The AI is busy right now. Please try again in a few seconds.",
    });
  }
  if (status === 402) {
    return new AIGatewayError({
      code: "credits_exhausted",
      status,
      message: `AI Gateway 402: ${body}`,
      userMessage:
        "AI credits have been exhausted on this workspace. Please add credits in Lovable to continue.",
    });
  }
  if (status >= 500) {
    return new AIGatewayError({
      code: "server_error",
      status,
      message: `AI Gateway ${status}: ${body}`,
      userMessage: "The AI service is temporarily unavailable. Please retry shortly.",
    });
  }
  return new AIGatewayError({
    code: "bad_request",
    status,
    message: `AI Gateway ${status}: ${body}`,
    userMessage: "The AI request was rejected. Please try a different photo or prompt.",
  });
}

export type ChatOptions = {
  /** Max retry attempts on 429/5xx/network/timeout. Default 3. */
  maxRetries?: number;
  /** Per-request timeout ms. Default 45000. */
  timeoutMs?: number;
  /** Optional fallback model identifiers tried in order if the primary fails non-recoverably. */
  fallbackModels?: string[];
  /** Abort signal from caller. */
  signal?: AbortSignal;
};

const RETRYABLE: AIGatewayErrorCode[] = ["rate_limited", "server_error", "timeout", "network"];

async function rawCall(body: Record<string, unknown>, timeoutMs: number, signal?: AbortSignal) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    throw new AIGatewayError({
      code: "missing_key",
      message: "Missing LOVABLE_API_KEY",
      userMessage: "AI is not configured on this project yet. Please contact the administrator.",
    });
  }
  const ctl = new AbortController();
  const onAbort = () => ctl.abort();
  signal?.addEventListener("abort", onAbort);
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw classify(res.status, text, parseRetryAfter(res.headers.get("retry-after")));
    }
    return await res.json();
  } catch (e: unknown) {
    if (e instanceof AIGatewayError) throw e;
    const err = e as { name?: string; message?: string };
    if (err?.name === "AbortError") {
      throw new AIGatewayError({
        code: "timeout",
        message: "AI Gateway request timed out",
        userMessage: "The AI took too long to respond. Please try again.",
      });
    }
    throw new AIGatewayError({
      code: "network",
      message: `Network error calling AI Gateway: ${err?.message ?? String(e)}`,
      userMessage: "Network problem reaching the AI. Check your connection and retry.",
    });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

function backoffMs(attempt: number, hinted?: number) {
  if (hinted && hinted > 0) return Math.min(hinted, 15000);
  // 400ms, 900ms, 2000ms (+ jitter)
  const base = Math.min(2000, 400 * Math.pow(2, attempt));
  return base + Math.floor(Math.random() * 250);
}

export async function lovableChat(
  body: Record<string, unknown>,
  options: ChatOptions = {},
) {
  const maxRetries = options.maxRetries ?? 3;
  const timeoutMs = options.timeoutMs ?? 45000;
  const models = [String(body.model ?? "google/gemini-2.5-flash"), ...(options.fallbackModels ?? [])];

  let lastErr: AIGatewayError | null = null;
  for (let m = 0; m < models.length; m++) {
    const attemptBody = { ...body, model: models[m] };
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await rawCall(attemptBody, timeoutMs, options.signal);
      } catch (e) {
        const err = e as AIGatewayError;
        lastErr = err;
        const retryable = RETRYABLE.includes(err.code);
        if (!retryable || attempt === maxRetries) break;
        await new Promise((r) => setTimeout(r, backoffMs(attempt, err.retryAfterMs)));
      }
    }
    // Try next fallback model only on credit/server/rate-limit class issues
    if (
      !lastErr ||
      !["server_error", "rate_limited", "credits_exhausted"].includes(lastErr.code)
    ) {
      break;
    }
  }
  throw lastErr ?? new AIGatewayError({
    code: "unknown",
    message: "Unknown AI Gateway failure",
    userMessage: "Something went wrong with the AI. Please try again.",
  });
}
