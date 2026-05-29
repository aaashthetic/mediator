import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { apiRateLimiter } from "@/lib/ratelimiter";

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/onboarding(.*)'])
const isDoctorRoute = createRouteMatcher(['/dashboard/doctor(.*)'])
const isPatientRoute = createRouteMatcher(['/dashboard/patient(.*)'])
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth()
    const { pathname } = req.nextUrl

    if (isApiRoute(req)) {
        // If authenticated, limit by user identity; otherwise fall back to IP address
        const identifier = userId || req.headers.get("x-forwarded-for") || "127.0.0.1";
        const { success } = await apiRateLimiter.limit(identifier);
        
        if (!success) {
        return new NextResponse(
            JSON.stringify({ error: "Rate limit exceeded. Too many requests." }),
            { status: 429, headers: { "Content-Type": "application/json" } }
        );
        }
    }

    if (!isProtectedRoute(req)) {
        return NextResponse.next()
    }

    if (!userId) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    const metadata = sessionClaims?.metadata as { role?: string; onboardingComplete?: boolean; doctorVerified?: boolean } | undefined
    const role = metadata?.role
    const isOnboarded = metadata?.onboardingComplete
    const isVerified = metadata?.doctorVerified


    if (role === 'doctor' && !isVerified) {
        // Allow them to read the pending screen, but block all other dashboard segments
        if (pathname === '/onboarding/pending') {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/onboarding/pending', req.url))
    }

    if (!isOnboarded) {
        // Allow them to stay on onboarding sub-paths without looping
        if (pathname.startsWith('/onboarding')) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    if (pathname.startsWith('/onboarding') && pathname !== '/onboarding/pending' && isOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Role-Based Route Guarding
    if (isDoctorRoute(req) && role !== 'doctor') {
        return NextResponse.redirect(new URL('/dashboard/patient', req.url))
    }
    
    if (isPatientRoute(req) && role !== 'patient') {
        return NextResponse.redirect(new URL('/dashboard/doctor', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}