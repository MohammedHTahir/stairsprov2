// Image editing through Vercel AI Gateway (OpenAI-compatible /v1/images/edits).
// Docs: https://vercel.com/docs/ai-gateway/modalities/image-generation/openai
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/images/edits";
const MODEL = "openai/gpt-image-2.5-sunburst";
const PING_MS = 10_000;

// Prefers an explicit API key; otherwise uses the OIDC token Vercel attaches to each
// function request (or the env token in local `vercel env pull` setups).
export function getGatewayKey(request?: Request): string | undefined {
  return (
    process.env["AI_GATEWAY_API_KEY"] ||
    request?.headers.get("x-vercel-oidc-token") ||
    process.env["VERCEL_OIDC_TOKEN"] ||
    undefined
  );
}

type GatewayImageResponse = {
  data?: { b64_json?: string }[];
  error?: { message?: string };
};

function sse(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function callGateway(apiKey: string, form: FormData, signal?: AbortSignal) {
  form.set("model", MODEL);
  // The gateway does not support streaming partial edits, so these are never forwarded.
  form.delete("stream");
  form.delete("partial_images");
  return fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    ...(signal ? { signal } : {}),
  });
}

/**
 * Edits an image and returns a Response the browser's `streamImage()` helper understands.
 *
 * AI Gateway returns one finished JSON image. When the client asked for a stream (the default),
 * we answer immediately with an SSE stream, keep it alive with comment pings while the model
 * works, then emit a single `image_edit.completed` event. This keeps the client unchanged and
 * avoids it re-sending (and re-billing) the request in its non-streaming fallback.
 */
export async function editImage(apiKey: string, form: FormData): Promise<Response> {
  const wantsStream = form.get("stream") !== "false";

  if (!wantsStream) {
    const upstream = await callGateway(apiKey, form);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  const abort = new AbortController();
  const encoder = new TextEncoder();
  let ping: ReturnType<typeof setInterval> | undefined;

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          /* client went away */
        }
      };
      send(": connected\n\n");
      ping = setInterval(() => send(": ping\n\n"), PING_MS);
      try {
        const upstream = await callGateway(apiKey, form, abort.signal);
        const json = (await upstream.json().catch(() => null)) as GatewayImageResponse | null;
        const b64 = json?.data?.[0]?.b64_json;
        if (!upstream.ok || !b64) {
          console.error("AI Gateway image edit failed", upstream.status, json?.error?.message);
          send(
            sse("error", {
              type: "error",
              error: {
                message:
                  json?.error?.message ??
                  (upstream.ok
                    ? "Image generation returned no image"
                    : `Image generation failed (${upstream.status})`),
              },
            }),
          );
        } else {
          send(sse("image_edit.completed", { type: "image_edit.completed", b64_json: b64 }));
        }
      } catch (error) {
        if (!abort.signal.aborted) {
          console.error("AI Gateway image edit threw", error);
          send(sse("error", { type: "error", error: { message: "Image generation failed" } }));
        }
      } finally {
        clearInterval(ping);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      clearInterval(ping);
      abort.abort();
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
