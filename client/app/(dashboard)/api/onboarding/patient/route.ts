import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { patientOnboardingSchema } from '@/lib/validations';

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
    const result = patientOnboardingSchema.safeParse(rawData);
    if (!result.success) {
      const errorMessages = result.error.flatten().fieldErrors;
      return NextResponse.json({ error: "Validation failed", details: errorMessages }, { status: 400 });
    }

    const { firstName, lastName, birthday, weight, height, phone, basicMedicalHistory } = result.data;

    // Connect to Clerk to grab default profile picture
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || null;

    // Insert records into db
    await db.insert(patients).values({
      id: userId,
      profilePicture,
      firstName,
      lastName,
      birthday,
      weight: weight.toString(),
      height: height.toString(),
      phone,
      basicMedicalHistory: basicMedicalHistory || null,
    });
    
    await client.users.updateUser(userId, {
      firstName,
      lastName,
    });

    // Push complete session flags to publicMetadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'patient',
        onboardingComplete: true,
        doctorVerified: true, 
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Patient Onboarding API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}