'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';

export default function PatientProfileForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    
    if (rawData.weight) rawData.weight = parseFloat(rawData.weight as string);
    if (rawData.height) rawData.height = parseInt(rawData.height as string, 10);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const token = await (window as any).Clerk?.session?.getToken();
      if (!token) throw new Error("Authentication token could not be verified.");

      const response = await fetch(`${apiBaseUrl}/api/patients`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rawData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save diagnostic demographics.');
      }

      setStatus({ type: 'success', text: 'Personal healthcare metadata records updated successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'An unexpected network engine connectivity error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {status && (
        <div className={`p-3.5 border rounded-xl text-xs font-medium ${
          status.type === 'success' 
            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400' 
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400'
        }`}>
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">First Name</label>
          <input required disabled={isSubmitting} type="text" name="firstName" defaultValue={initialData?.firstName || ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Name</label>
          <input required disabled={isSubmitting} type="text" name="lastName" defaultValue={initialData?.lastName || ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Date of Birth</label>
          <input required disabled={isSubmitting} type="date" name="birthday" defaultValue={initialData?.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Weight (kg)</label>
          <input required disabled={isSubmitting} type="number" step="0.1" name="weight" defaultValue={initialData?.weight || ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Height (cm)</label>
          <input required disabled={isSubmitting} type="number" name="height" defaultValue={initialData?.height || ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Contact Phone Number</label>
        <input required disabled={isSubmitting} type="tel" name="phone" defaultValue={initialData?.phone || ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70 font-mono" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Basic Medical History</label>
        <textarea disabled={isSubmitting} name="basicMedicalHistory" defaultValue={initialData?.basicMedicalHistory || ""} rows={4} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70 leading-relaxed" />
      </div>

      <div className="pt-4 border-t border-border/60 flex items-center justify-end">
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-500/10 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save size={14} />}
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}