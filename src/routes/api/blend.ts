import { createFileRoute } from "@tanstack/react-router";
import { editImage, getGatewayKey } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/blend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = getGatewayKey();
        if (!apiKey) return new Response("Missing AI_GATEWAY_API_KEY", { status: 500 });
        const form = await request.formData();
        return editImage(apiKey, form);
      },
    },
  },
});
