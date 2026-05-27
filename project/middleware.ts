import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isDoctorRoute = createRouteMatcher(['/dashboard/doctor(.*)'])
const isPatientRoute = createRouteMatcher(['/dashboard/patient(.*)'])

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth()

    // If not logged in and trying to access protected dashboards
    if (!userId && (isDoctorRoute(req) || isPatientRoute(req))) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    const role = sessionClaims?.role
    const isVerified = sessionClaims?.doctorVerified

    // If logged in but hasn't picked a role, send to onboarding
    if (userId && !role && req.nextUrl.pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    // Route Guarding by Role
    if (isDoctorRoute(req) && role !== 'doctor') {
        return NextResponse.redirect(new URL('/dashboard/patient', req.url))
    }
    
    if (isPatientRoute(req) && role !== 'patient') {
        return NextResponse.redirect(new URL('/dashboard/doctor', req.url))
    }

    // Strict Doctor Verification Interception
    if (role === 'doctor' && !isVerified && req.nextUrl.pathname !== '/onboarding/pending') {
        return NextResponse.redirect(new URL('/onboarding/pending', req.url))
    }
})

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}