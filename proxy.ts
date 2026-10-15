import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and self-hosted fonts in public/
     *   (.svg, .png, .jpg, .jpeg, .gif, .webp, .avif, .ico, .woff, .woff2, .ttf, .otf, .eot)
     * Proxy runs before public files. Font requests must skip auth or
     * anonymous visitors are redirected to login and the font never loads.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|eot)$).*)",
  ],
};
