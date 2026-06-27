import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("[server.error]", error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const requestLogger = createMiddleware().server(async ({ next, request }) => {
  const started = Date.now();
  const url = new URL(request.url);
  try {
    const result = await next();
    const ms = Date.now() - started;
    const status = (result as { response?: Response })?.response?.status ?? "?";
    if (ms > 1000 || (typeof status === "number" && status >= 400)) {
      console.warn(`[req] ${request.method} ${url.pathname} -> ${status} (${ms}ms)`);
    } else {
      console.log(`[req] ${request.method} ${url.pathname} -> ${status} (${ms}ms)`);
    }
    return result;
  } catch (error) {
    console.error(`[req.error] ${request.method} ${url.pathname} (${Date.now() - started}ms)`, error);
    throw error;
  }
});

const fnLogger = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const started = Date.now();
  try {
    const result = await next();
    const ms = Date.now() - started;
    if (ms > 1000) console.warn(`[serverFn] slow ${ms}ms`);
    return result;
  } catch (error) {
    console.error(`[serverFn.error] (${Date.now() - started}ms)`, error);
    throw error;
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, fnLogger],
  requestMiddleware: [errorMiddleware, requestLogger],
}));

