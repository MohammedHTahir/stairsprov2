import { createFileRoute } from "@tanstack/react-router";
import { editImage, getGatewayKey } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/blend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = getGatewayKey(request);
        if (!apiKey) return new Response("AI Gateway is not configured", { status: 500 });
        const form = await request.formData();
        return editImage(apiKey, form);
      },
    },
  },
});
