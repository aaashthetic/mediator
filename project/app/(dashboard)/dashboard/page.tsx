import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { TrendingUp, Users, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import PatientHub from './patient/page';
import DoctorHub from './doctor/page';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Fetch metadata directly from Clerk session memory
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.publicMetadata;

  if (!metadata?.onboardingComplete) {
    redirect('/onboarding');
  }

  if (metadata.role === 'doctor') {
    return <DoctorHub userId={userId} />;
  }

  return <PatientHub userId={userId} />;
}