'use client';

import { useState } from 'react';
import { Loader2, Save, Sparkles } from 'lucide-react';

export default function DoctorProfileForm({ initialData }: { initialData: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());
    if (rawData.consultationFee) rawData.consultationFee = parseInt(rawData.consultationFee as string, 10);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const token = await (window as any).Clerk?.session?.getToken();
      if (!token) throw new Error("Authentication token could not be verified.");

      const response = await fetch(`${apiBaseUrl}/api/doctors`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rawData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update practitioner configuration.');
      }

      setStatus({ type: 'success', text: 'Professional clinical profile updated successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', text: err.message || 'An unexpected server communication layer runtime fault occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {status && (
        <div className={`p-3.5 border rounded-xl text-xs font-medium ${
          status.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Medical Specialization</label>
          <input required disabled={isSubmitting} type="text" name="specialization" defaultValue={initialData?.specialization || ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Consultation Fee (PHP)</label>
          <input required disabled={isSubmitting} type="number" min="0" step="50" name="consultationFee" defaultValue={initialData?.consultationFee || "500"} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70 font-mono" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Practice Start Date</label>
        <input required disabled={isSubmitting} type="date" name="medicalPracticeStartDate" defaultValue={initialData?.medicalPracticeStartDate ? new Date(initialData.medicalPracticeStartDate).toISOString().split('T')[0] : ""} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70" />
      </div>

      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Professional Biography</label>
        <textarea required disabled={isSubmitting} name="bio" defaultValue={initialData?.bio || ""} rows={4} className="w-full text-xs p-2.5 border rounded-lg bg-transparent border-border/70 leading-relaxed" />
      </div>

      {initialData && (
        <div className="p-3 bg-muted/40 border border-border/60 rounded-xl flex items-center gap-2 text-muted-foreground text-[10px] font-mono uppercase tracking-wide">
          <Sparkles size={12} className="text-emerald-500 animate-pulse" />
          <span>Status: {initialData.isVerified ? "Verified Practitioner Account" : "Credentials Pending Verification Queue"}</span>
        </div>
      )}

      <div className="pt-4 border-t border-border/60 flex items-center justify-end">
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/10 disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save size={14} />}
          {isSubmitting ? 'Syncing...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}