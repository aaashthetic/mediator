'use server'

import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function completePatientOnboarding(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();

  // Extract Patient Inputs
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const birthday = formData.get('birthday') as string;
  const weight = formData.get('weight') as string;
  const height = formData.get('height') as string;
  const phone = formData.get('phone') as string;
  const medicalHistory = formData.get('medicalHistory') as string;

  // Update Clerk's system data so it matches their input profile
  await client.users.updateUser(userId, {
    firstName: firstName || '',
    lastName: lastName || '',
  });

  // Save medical properties securely to Clerk Metadata
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: 'patient',
      onboardingComplete: true,
      doctorVerified: true, // Bypass verification check
    },
    privateMetadata: {
      birthday,
      weight,
      height,
      phone,
      medicalHistory
    }
  });

  redirect('/dashboard');
}

export async function completeDoctorOnboarding(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();

  // Extract Doctor Inputs
  const specialization = formData.get('specialization') as string;
  const bio = formData.get('bio') as string;

  // Save details to Clerk Metadata
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: 'doctor',
      onboardingComplete: true,
      doctorVerified: false, 
      specialization,
    },
    privateMetadata: {
      bio
    }
  });

  redirect('/dashboard');
}