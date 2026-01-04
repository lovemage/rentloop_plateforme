import { auth } from "@/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth?.user?.id;
    const protectedPaths = ["/items/new", "/member", "/admin"];
    const isOnProtectedPage = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

    if (isOnProtectedPage && !isLoggedIn) {
        return Response.redirect(new URL("/auth", req.nextUrl));
    }
});

export const config = {
    // Match check for all request except static files
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
