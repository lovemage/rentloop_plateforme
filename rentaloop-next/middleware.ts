import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth?.user?.id;
    const protectedPaths = ["/items/new", "/member", "/admin"];
    const isOnProtectedPage = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

    if (isOnProtectedPage && !isLoggedIn) {
        return Response.redirect(new URL("/auth", req.nextUrl));
    }

    // Add x-pathname header for layout detection
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", req.nextUrl.pathname);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
});

export const config = {
    // Match check for all request except static files
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
