import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

const UNPREFIXED_REDIRECTS: Array<{ prefix: string; target: string }> = [
  // Legacy unprefixed Albanian routes -> /sq/...
  { prefix: "/lajme", target: "/sq/lajme" },
  { prefix: "/historia", target: "/sq/historia" },
  { prefix: "/galeria", target: "/sq/galeria" },
  { prefix: "/kontribuo", target: "/sq/kontribuo" },
  // Unprefixed English routes -> /en/...
  { prefix: "/news", target: "/en/news" },
  { prefix: "/history", target: "/en/history" },
  { prefix: "/gallery", target: "/en/gallery" },
  { prefix: "/contribute", target: "/en/contribute" },
  // Unprefixed German routes -> /de/...
  { prefix: "/nachrichten", target: "/de/nachrichten" },
  { prefix: "/geschichte", target: "/de/geschichte" },
  { prefix: "/galerie", target: "/de/galerie" },
  { prefix: "/mitmachen", target: "/de/mitmachen" },
];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}`;
    return NextResponse.redirect(url);
  }

  for (const { prefix, target } of UNPREFIXED_REDIRECTS) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const rest = pathname.slice(prefix.length);
      const url = request.nextUrl.clone();
      url.pathname = `${target}${rest}`;
      return NextResponse.redirect(url);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api(?:/|$)|admin(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|.*\\..*).*)"],
};
