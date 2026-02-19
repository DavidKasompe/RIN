import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /dashboard routes — check for better-auth session cookie
    if (pathname.startsWith('/dashboard')) {
        const sessionToken =
            request.cookies.get('better-auth.session_token') ??
            request.cookies.get('__Secure-better-auth.session_token');

        if (!sessionToken?.value) {
            const url = request.nextUrl.clone();
            url.pathname = '/signin';
            url.searchParams.set('from', pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
