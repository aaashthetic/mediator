import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { doctors } from '@/lib/db/schema';
import { doctorOnboardingSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    // Authenticate user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON body payload
    const rawData = await request.json();

    // Validate data with Zod schema
    const result = doctorOnboardingSchema.safeParse(rawData);
    if (!result.success) {
      const errorMessages = result.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Validation failed", details: errorMessages }, { status: 400 });
    }

    // Destructure your new database fields from the validated data payload
    const { 
      firstName, 
      lastName, 
      specialization, 
      bio, 
      consultationFee, 
      medicalPracticeStartDate 
    } = result.data;

    // Retrieve the Clerk profile picture link
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || null;

    // Insert structured record details straight into your updated doctors table
    await db.insert(doctors).values({
      id: userId,
      profilePicture,
      firstName,
      lastName,
      specialization,
      bio,
      isVerified: false,
      consultationFee: Number(consultationFee).toFixed(2),
      medicalPracticeStartDate: new Date(medicalPracticeStartDate),
    });

    // Mirror updates inside the Clerk Core User Profile instance
    await client.users.updateUser(userId, {
      firstName,
      lastName,
    });

    // Push roles and verification flags directly into metadata tokens
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'doctor',
        onboardingComplete: true,
        doctorVerified: false,
        specialization,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Doctor Onboarding API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}