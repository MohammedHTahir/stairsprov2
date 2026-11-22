// Cloudflare Workers AI image editing via FLUX.2 [klein] 4B.
// Model supports up to four reference images; each input image must be below 512x512.
const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const PING_MS = 10_000;

export function getGatewayKey(): string | undefined {
  return process.env["CLOUDFLARE_API_TOKEN"] || undefined;
}
export function getCloudflareAccountId(): string | undefined {
  return process.env["CLOUDFLARE_ACCOUNT_ID"] || undefined;
}

type CloudflareResponse = {
  success?: boolean;
  result?: { image?: string };
  errors?: { message?: string; code?: number }[];
};
function sse(event: string, payload: unknown) {
  return `event: ${event}\\ndata: ${JSON.stringify(payload)}\\n\\n`;
}
function cloudflareError(json: CloudflareResponse | null, status: number) {
  const message = json?.errors?.map(error => error.message).filter(Boolean).join("; ");
  if (status === 429) return "Cloudflare's free AI allowance or rate limit has been reached. Please try again later.";
  if (status === 401 || status === 403) return "Cloudflare rejected the API credentials. Check CLOUDFLARE_API_TOKEN permissions.";
  return message || `Cloudflare image generation failed (${status}).`;
}
async function callCloudflare(token: string, accountId: string, input: FormData, signal?: AbortSignal) {
  const prompt = String(input.get("prompt") ?? "").trim();
  if (!prompt) throw new Error("An image prompt is required.");
  const images = input.getAll("image[]").filter((value): value is File => value instanceof File && value.size > 0);
  const legacyImages = input.getAll("image").filter((value): value is File => value instanceof File && value.size > 0);
  const sourceImages = [...images, ...legacyImages].slice(0, 4);
  const form = new FormData();
  form.set("prompt", prompt);
  form.set("width", "1024");
  form.set("height", "768");
  sourceImages.forEach((image, index) => form.append(`input_image_${index}`, image, image.name || `reference-${index}.png`));
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    ...(signal ? { signal } : {}),
  });
  const json = await response.json().catch(() => null) as CloudflareResponse | null;
  if (!response.ok || !json?.success || !json.result?.image) {
    throw new Error(cloudflareError(json, response.status));
  }
  return json.result.image;
}

/** Keeps the existing SSE contract so the UI does not need a provider-specific client. */
export async function editImage(token: string, form: FormData): Promise<Response> {
  const accountId = getCloudflareAccountId();
  if (!accountId) return Response.json({ message: "Cloudflare AI is not configured. Set CLOUDFLARE_ACCOUNT_ID." }, { status: 503 });
  const abort = new AbortController();
  const encoder = new TextEncoder();
  let ping: ReturnType<typeof setInterval> | undefined;
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (value: string) => { try { controller.enqueue(encoder.encode(value)); } catch { /* client disconnected */ } };
      send(": connected\\n\\n");
      ping = setInterval(() => send(": ping\\n\\n"), PING_MS);
      try {
        const b64 = await callCloudflare(token, accountId, form, abort.signal);
        send(sse("image_edit.completed", { type: "image_edit.completed", b64_json: b64 }));
      } catch (error) {
        if (!abort.signal.aborted) {
          const message = error instanceof Error ? error.message : "Cloudflare image generation failed.";
          console.error("Cloudflare Workers AI image edit failed", message);
          send(sse("error", { type: "error", error: { message } }));
        }
      } finally {
        clearInterval(ping);
        try { controller.close(); } catch { /* already closed */ }
      }
    },
    cancel() { clearInterval(ping); abort.abort(); },
  });
  return new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } });
}
