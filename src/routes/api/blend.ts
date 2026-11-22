import { createFileRoute } from "@tanstack/react-router";
import { editImage, getGatewayKey } from "@/lib/image-gateway.server";
import { authenticateRequest } from "@/integrations/supabase/auth-middleware";

export const Route = createFileRoute("/api/blend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if ('response' in auth) return auth.response;
        const apiKey = getGatewayKey(request);
        if (!apiKey) return new Response("AI Gateway is not configured", { status: 500 });
        const form = await request.formData();
        return editImage(apiKey, form);
      },
    },
  },
});
