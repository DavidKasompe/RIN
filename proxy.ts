import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard', '/onboarding', '/settings'];
const authRoutes = ['/signin', '/signup'];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const sessionToken =
        request.cookies.get('better-auth.session_token') ??
        request.cookies.get('__Secure-better-auth.session_token');

    const isAuthenticated = !!sessionToken?.value;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    if (isAuthenticated && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    if (!isAuthenticated && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};

