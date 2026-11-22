import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="text-7xl font-bold text-foreground">404</h1><h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p><Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go home</Link></div></div>;
}
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center"><h1 className="text-xl font-semibold">This page didn't load</h1><p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing.</p><button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); router.invalidate(); reset(); }}>Try again</button></div></div>;
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({ meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    { title: "Sahaab Stair Studio" },
    { name: "description", content: "Find the closest real staircase reference for your chosen configuration." },
    { name: "theme-color", content: "#f8f5f0" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
  ], links: [
    { rel: "stylesheet", href: appCss },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Manrope:wght@400;500;600;700&display=swap" },
    { rel: "icon", type: "image/png", href: "/favicon.png" },
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "apple-touch-icon", href: "/icon-512.jpg" },
  ] }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>;
}
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><Outlet /><Toaster position="top-center" /></QueryClientProvider>;
}
