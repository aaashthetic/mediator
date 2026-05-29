'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

interface FormProps {
  initialPhone: string;
}

export default function OnboardingClientForm({ initialPhone }: FormProps) {
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Unified Form Submission Handler
  const handleOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>, currentRole: 'patient' | 'doctor') => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    const endpoint = currentRole === 'patient' 
      ? await '/api/onboarding/patient'
      : await '/api/onboarding/doctor';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rawData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Onboarding registration failed.');
      }

      // Force Clerk to update browser session cookie token
      if (isLoaded && user) {
        await user.reload();
      }

      // Navigate safely to the dashboard entry root
      router.push('/dashboard');
      router.refresh();

    } catch (err: any) {
      console.error("Submission failed:", err);
      setApiError(err.message || 'An unexpected runtime connection error occurred.');
      setIsSubmitting(false);
    }
  };
  
  // Choose Role View
  if (!role) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-zinc-100">Welcome!</h1>
        <p className="text-sm text-slate-500 mb-6 dark:text-zinc-400">Please choose your role to set up your account profile.</p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => setRole('patient')}
            className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition text-center"
          >
            <span className="text-xl mb-1">🩹</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-200">Patient</span>
          </button>
          <button 
            type="button"
            onClick={() => setRole('doctor')}
            className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition text-center"
          >
            <span className="text-xl mb-1">🩺</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-200">Doctor</span>
          </button>
        </div>
      </div>
    );
  }

  // Patient Form
  if (role === 'patient') {
    return (
      <form onSubmit={(e) => handleOnboardingSubmit(e, 'patient')} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Patient Profile Setup</h2>
        <button type="button" disabled={isSubmitting} onClick={() => setRole(null)} className="text-xs text-blue-500 hover:underline disabled:opacity-50">← Go Back</button>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">First Name</label>
            <input required disabled={isSubmitting} type="text" name="firstName" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Last Name</label>
            <input required disabled={isSubmitting} type="text" name="lastName" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Birthday</label>
            <input required disabled={isSubmitting} type="date" name="birthday" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Weight (kg)</label>
            <input required disabled={isSubmitting} type="number" step="0.1" name="weight" placeholder="e.g. 65.5" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Height (cm)</label>
            <input required disabled={isSubmitting} type="number" name="height" placeholder="e.g. 170" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Contact Number</label>
          <input required disabled={isSubmitting} type="tel" name="phone" defaultValue={initialPhone} className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Basic Medical History</label>
          <textarea disabled={isSubmitting} name="basicMedicalHistory" placeholder="Allergies, chronic conditions, current maintenance medications..." rows={3} className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Finalizing Profile...' : 'Complete Patient Onboarding'}
        </button>
      </form>
    );
  }

  // Doctor Form
  return (
    <form onSubmit={(e) => handleOnboardingSubmit(e, 'doctor')} className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Doctor Professional Profile</h2>
      <button type="button" disabled={isSubmitting} onClick={() => setRole(null)} className="text-xs text-blue-500 hover:underline disabled:opacity-50">← Go Back</button>

      <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">First Name</label>
            <input required disabled={isSubmitting} type="text" name="firstName" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Last Name</label>
            <input required disabled={isSubmitting} type="text" name="lastName" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
          </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Medical Specialization</label>
        <input required disabled={isSubmitting} type="text" name="specialization" placeholder="e.g. Cardiologist, Pediatrician, General Physician" className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Professional Bio</label>
        <textarea required disabled={isSubmitting} name="bio" placeholder="Brief statement about your clinical background, experience, or medical practice mission..." rows={4} className="w-full p-2 border rounded-md bg-transparent disabled:bg-slate-50" />
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
        ⚠️ <strong>Note:</strong> Your profile will enter verification review once submitted. You will access full features when verified.
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition flex items-center justify-center gap-2 disabled:opacity-50">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Submitting Records...' : 'Submit Credentials'}
      </button>
    </form>
  );
}