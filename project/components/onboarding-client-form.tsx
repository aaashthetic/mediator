'use client';

import { useState } from 'react';

interface FormProps {
  initialPhone: string;
  patientAction: (formData: FormData) => Promise<void>;
  doctorAction: (formData: FormData) => Promise<void>;
}

export default function OnboardingClientForm({ initialPhone, patientAction, doctorAction }: FormProps) {
  const [role, setRole] = useState<'doctor' | 'patient' | null>(null);

  // Choose Role View
  if (!role) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2 text-slate-800 dark:text-zinc-100">Welcome!</h1>
        <p className="text-sm text-slate-500 mb-6 dark:text-zinc-400">Please choose your role to set up your account profile.</p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setRole('patient')}
            className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition text-center"
          >
            <span className="text-xl mb-1">🩹</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-200">I am a Patient</span>
          </button>
          <button 
            onClick={() => setRole('doctor')}
            className="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition text-center"
          >
            <span className="text-xl mb-1">🩺</span>
            <span className="font-semibold text-slate-700 dark:text-zinc-200">I am a Doctor</span>
          </button>
        </div>
      </div>
    );
  }

  // Patient Form
  if (role === 'patient') {
    return (
      <form action={patientAction} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Patient Profile Setup</h2>
        <button type="button" onClick={() => setRole(null)} className="text-xs text-blue-500 hover:underline">← Go Back</button>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">First Name</label>
            <input required type="text" name="firstName" className="w-full p-2 border rounded-md bg-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Last Name</label>
            <input required type="text" name="lastName" className="w-full p-2 border rounded-md bg-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Birthday</label>
            <input required type="date" name="birthday" className="w-full p-2 border rounded-md bg-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Weight (kg)</label>
            <input required type="number" step="0.1" name="weight" placeholder="e.g. 65.5" className="w-full p-2 border rounded-md bg-transparent" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Height (cm)</label>
            <input required type="number" name="height" placeholder="e.g. 170" className="w-full p-2 border rounded-md bg-transparent" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Contact Number</label>
          <input required type="tel" name="phone" defaultValue={initialPhone} className="w-full p-2 border rounded-md bg-transparent" />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Basic Medical History</label>
          <textarea name="medicalHistory" placeholder="Allergies, chronic conditions, current maintenance medications..." rows={3} className="w-full p-2 border rounded-md bg-transparent" />
        </div>

        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition">
          Complete Patient Onboarding
        </button>
      </form>
    );
  }

  // Doctor Form
  return (
    <form action={doctorAction} className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Doctor Professional Profile</h2>
      <button type="button" onClick={() => setRole(null)} className="text-xs text-blue-500 hover:underline">← Go Back</button>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Medical Specialization</label>
        <input required type="text" name="specialization" placeholder="e.g. Cardiologist, Pediatrician, General Physician" className="w-full p-2 border rounded-md bg-transparent" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Professional Bio</label>
        <textarea required name="bio" placeholder="Brief statement about your clinical background, experience, or medical practice mission..." rows={4} className="w-full p-2 border rounded-md bg-transparent" />
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs">
        ⚠️ <strong>Note:</strong> Your profile will enter verification review once submitted. You will access full features when verified.
      </div>

      <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition">
        Submit Credentials
      </button>
    </form>
  );
}