import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/onboarding(.*)'])
const isDoctorRoute = createRouteMatcher(['/dashboard/doctor(.*)'])
const isPatientRoute = createRouteMatcher(['/dashboard/patient(.*)'])

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth()
    const { pathname } = req.nextUrl

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


    if (!isOnboarded) {
        // Allow them to stay on onboarding sub-paths without looping
        if (pathname.startsWith('/onboarding')) {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    if (pathname.startsWith('/onboarding') && isOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (role === 'doctor' && !isVerified) {
        // Allow them to read the pending screen, but block all other dashboard segments
        if (pathname === '/onboarding/pending') {
            return NextResponse.next()
        }
        return NextResponse.redirect(new URL('/onboarding/pending', req.url))
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