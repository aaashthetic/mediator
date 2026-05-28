import { db } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { appointments } from '@/lib/db/schema';
import { Calendar, FileText, HeartPulse } from 'lucide-react';
import Link from 'next/link';

export default async function PatientHub({ userId }: { userId: string }) {
  // Fetch appointments from db
  const patientAppointments = await db.query.appointments.findMany({
    where: eq(appointments.patientId, userId),
    limit: 3,
    orderBy: [desc(appointments.createdAt)],
    with: { doctor: true }
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-md">
        <h1 className="text-2xl font-bold">Welcome back to MEDiator!</h1>
        <p className="mt-1 text-blue-100 text-sm">Your health profile is active. Book consultations or review your clinical records below.</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <HeartPulse className="text-blue-600 h-5 w-5" /> Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/appointments/new" className="w-full text-center py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
              Find a Doctor / Book Slot
            </Link>
            <Link href="/dashboard/records" className="w-full text-center py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 border border-slate-200 transition">
              View History Notes
            </Link>
          </div>
        </div>

        {/* Dynamic Appointments Queue */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-xl">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600 h-5 w-5" /> Upcoming Consultations
          </h2>
          
          {patientAppointments.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No active appointments scheduled. Need a checkup?</p>
          ) : (
            <div className="space-y-3">
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Dr. {apt.doctor.lastName}</p>
                    <p className="text-xs text-slate-500 capitalize">Specialty: {apt.doctor.specialization}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}