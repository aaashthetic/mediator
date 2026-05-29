import { db } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';
import { appointments, doctors as doctorsTable } from '@/lib/db/schema';
import { Calendar, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { DoctorDirectory } from '@/components/doctor-directory';

export default async function PatientHub({ userId }: { userId: string }) {
  // Fetch real appointments from the database matching your schema relations
  const patientAppointments = await db.query.appointments.findMany({
    where: eq(appointments.patientId, userId),
    limit: 3,
    orderBy: [desc(appointments.createdAt)],
    with: { 
      doctor: true,
      schedule: true // Pulling the slot times as well
    }
  });

  // Fetch verified doctors directly from your PG schema table
  const verifiedDoctors = await db.query.doctors.findMany({
    where: eq(doctorsTable.isVerified, true),
    orderBy: [desc(doctorsTable.lastName)]
  });

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-md">
        <h1 className="text-2xl font-bold">Welcome back to MEDiator!</h1>
        <p className="mt-1 text-blue-100 text-sm">Your health profile is active. Book consultations or review your clinical records below.</p>
      </div>

      {/* Grid Layout Summary Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-card text-card-foreground border p-6 rounded-xl space-y-4 shadow-sm">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <HeartPulse className="text-primary h-5 w-5" /> Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/patient/appointments" className="w-full text-center py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition shadow-sm">
              Book Appointment Slot
            </Link>
            <Link href="/dashboard/patient/records" className="w-full text-center py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:bg-muted/80 border transition">
              View History Notes
            </Link>
          </div>
        </div>

        {/* Dynamic Appointments Queue matching your status enum mapping */}
        <div className="md:col-span-2 bg-card text-card-foreground border p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="text-primary h-5 w-5" /> Upcoming Consultations
          </h2>
          
          {patientAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              No active appointments scheduled. Need a checkup?
            </p>
          ) : (
            <div className="space-y-3">
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Specialty: {apt.doctor.specialization}
                    </p>
                    {apt.schedule && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(apt.schedule.startTime).toLocaleDateString()} @ {new Date(apt.schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-sm ${
                    apt.status === 'confirmed' || apt.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : apt.status === 'cancelled'
                      ? 'bg-destructive/10 text-destructive border-destructive/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-border" />

      {/* Directory Section passing database entities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Medical Practitioners Directory</h2>
          <p className="text-sm text-muted-foreground">Search and sort verified specialists available across clinical networks.</p>
        </div>
        <DoctorDirectory doctors={verifiedDoctors} />
      </div>
    </div>
  );
}