import { afterEach, describe, expect, it, vi } from "vitest";
import { editImage } from "./image-gateway.server";

afterEach(() => vi.unstubAllGlobals());

const makeForm = (stream?: string) => {
  const form = new FormData();
  form.append("prompt", "p");
  form.append("image[]", new File(["x"], "a.png", { type: "image/png" }));
  form.set("partial_images", "1");
  if (stream) form.set("stream", stream);
  return form;
};

describe("editImage (Vercel AI Gateway)", () => {
  it("calls the gateway without stream fields and emits one SSE completed event", async () => {
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const body = init.body as FormData;
      expect(body.get("model")).toBe("openai/gpt-image-2.5-sunburst");
      expect(body.has("stream")).toBe(false);
      expect(body.has("partial_images")).toBe(false);
      return Response.json({ data: [{ b64_json: "QUJD" }] });
    });
    vi.stubGlobal("fetch", fetchMock);
    const res = await editImage("key", makeForm());
    expect(fetchMock.mock.calls[0]![0]).toBe("https://ai-gateway.vercel.sh/v1/images/edits");
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    const text = await res.text();
    expect(text).toContain("event: image_edit.completed");
    expect(text).toContain('"b64_json":"QUJD"');
  });

  it("surfaces upstream errors as an SSE error event", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: { message: "blocked" } }, { status: 400 })));
    const text = await (await editImage("key", makeForm())).text();
    expect(text).toContain("event: error");
    expect(text).toContain("blocked");
  });

  it("returns plain JSON when stream=false", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ data: [{ b64_json: "QUJD" }] })));
    const res = await editImage("key", makeForm("false"));
    expect(((await res.json()) as { data: { b64_json: string }[] }).data[0]!.b64_json).toBe("QUJD");
  });
});
