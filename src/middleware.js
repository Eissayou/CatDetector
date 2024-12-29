import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
    console.log("Middleware is running!");
    const token = req.cookies.get('token')?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Public Routes
    const isPublicRoute = req.nextUrl.pathname === '/login'

    if (isPublicRoute) {
        if (token) {
            try {
                // Verify the JWT
                await jwtVerify(token, secret);

                // Token is valid, allow access to "/"
                return NextResponse.redirect(new URL('/', req.url));
            }
            catch (error) {
                // Redirect to login if token is invalid or expired
                console.error('JWT Verification Error:', error);
                return NextResponse.redirect(new URL('/login', req.url));
            }
        }
        return NextResponse.next();
    }

    // Protected Route ("/")
    if (req.nextUrl.pathname === '/') {
        if (!token) {
            // Redirect to login if no token and accessing root route
            return NextResponse.redirect(new URL('/login', req.url));
        }

        try {
            // Verify the JWT
            await jwtVerify(token, secret);

            // Token is valid, allow access to "/"
            return NextResponse.next();
        } catch (error) {
            // Redirect to login if token is invalid or expired
            console.error('JWT Verification Error:', error);
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }
}

// Matcher is for which directory is protected
export const config = {
    matcher: ['/((?!api|_next).*)'], // Match all paths except those starting with "api" or "_next"
  };