'use server'

import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { patients, doctors } from '@/lib/db/schema';
import { patientOnboardingSchema, doctorOnboardingSchema } from '@/lib/validations';

export async function completePatientOnboarding(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();

  // Fetch user from Clerk to get their default profile picture
  const clerkUser = await client.users.getUser(userId);
  const profilePicture = clerkUser.imageUrl || null;

  // Transform FormData into a plain object and validate with Zod
  const rawData = Object.fromEntries(formData.entries());
  const result = patientOnboardingSchema.safeParse(rawData);

  if (!result.success) {
    const errorMessages = result.error.flatten().fieldErrors;
    throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
  }

  const { firstName, lastName, birthday, weight, height, phone, basicMedicalHistory } = result.data;

  // Insert into db
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

  // Update Clerk Core Instance Properties
  await client.users.updateUser(userId, {
    firstName: firstName,
    lastName: lastName,
  });

  // Update Clerk Metadata
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: 'patient',
      onboardingComplete: true,
      doctorVerified: true, 
    }
  });

  return { success: true };
}

export async function completeDoctorOnboarding(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const profilePicture = clerkUser.imageUrl || null;

  // Transform FormData into an object and validate with Zod
  const rawData = Object.fromEntries(formData.entries());
  const result = doctorOnboardingSchema.safeParse(rawData);

  if (!result.success) {
    const errorMessages = result.error.flatten().fieldErrors;
    throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
  }

  const { firstName, lastName, specialization, bio } = result.data;

  // Insert into db
  await db.insert(doctors).values({
    id: userId,
    profilePicture,
    firstName,
    lastName,
    specialization,
    bio,
    isVerified: false, // Default state until admin reviews credentials
  });

  // Update Clerk Metadata
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: 'doctor',
      onboardingComplete: true,
      doctorVerified: false,
      specialization,
    }
  });

  return { success: true };
}