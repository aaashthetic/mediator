import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import OnboardingClientForm from '@/components/onboarding-client-form';

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  // Skip onboarding if they already completed it
  if (user.publicMetadata?.onboardingComplete) {
    redirect('/dashboard');
  }

  // Pre-populate phone number if they signed up using it
  const initialPhone = user.phoneNumbers?.[0]?.phoneNumber || '';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-900">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-md dark:bg-zinc-800">
        <OnboardingClientForm 
          initialPhone={initialPhone}
        />
      </div>
    </div>
  );
}