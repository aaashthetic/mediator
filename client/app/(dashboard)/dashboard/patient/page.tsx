import { eq, desc, and } from 'drizzle-orm';
import { Calendar, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { DoctorDirectory } from '@/components/doctor-directory';
import { headers } from 'next/headers';
import { auth } from '@clerk/nextjs/server';

interface Doctor {
  firstName: string;
  lastName: string;
  specialization: string;
}

interface Schedule {
  startTime: string;
  endTime: string;
  date?: string;
  time?: string;
}

interface Appointment {
  id: string | number;
  status: string;
  doctor?: Doctor;
  schedule?: Schedule;
}

export default async function PatientHub() {
  let patientAppointments: Appointment[] = [];
  let verifiedDoctors = [];

  try {
    // Forward headers/cookies so auth() inside the API route can verify who is logged in
    const { userId, getToken } = await auth();
    const token = await getToken();

    if (userId && token) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
      const appointmentsResponse = await fetch(`${apiBaseUrl}/api/appointments?role=patient&userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        next: { revalidate: 0 }
      });

      if (appointmentsResponse.ok) {
        const appointmentData = await appointmentsResponse.json();
        patientAppointments = (appointmentData.appointments || [])
          .filter((apt: Appointment) => apt.status === 'confirmed')
          .slice(0, 3);
      }
    
      // Fetch verified doctors from API route
      const response = await fetch(`${apiBaseUrl}/api/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        next: { revalidate: 0 }
      });

      if (response.ok) {
        const data = await response.json();
        verifiedDoctors = data.doctors || [];
      }
    }
  } catch (error) {
    console.error("Failed to hydrate directory from API route:", error);
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-primary to-primary/70 rounded-2xl text-primary-foreground shadow-md animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
        <h1 className="text-2xl font-bold">Welcome back to MEDiator!</h1>
        <p className="mt-1 opacity-90 text-sm">Discover medical professionals, book consultations, and manage your health journey.</p>
      </div>

      {/* Grid Layout Summary Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-backwards">
        {/* Quick Actions Card */}
        <div className="bg-card text-card-foreground border p-6 rounded-xl space-y-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <HeartPulse className="text-primary h-5 w-5" /> Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/patient/appointments" className="w-full text-center py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition shadow-sm active:scale-[0.98]">
              Book Appointment Slot
            </Link>
            <Link href="/dashboard/patient/records" className="w-full text-center py-2 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:bg-muted/80 border transition active:scale-[0.98]">
              View Health Records
            </Link>
          </div>
        </div>

        {/* Dynamic Appointments Queue */}
        <div className="md:col-span-2 bg-card text-card-foreground border p-6 rounded-xl shadow-sm flex flex-col h-[180px]">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="text-primary h-5 w-5" /> Upcoming Consultations
          </h2>
          
          {patientAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              No active appointments scheduled. Need a checkup?
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {patientAppointments.map((apt: Appointment, index: number) => (
                <div key={apt.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg border" style={{ animationDelay: `${index * 75}ms` }}>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Specialization: {apt.doctor?.specialization}
                    </p>
                    {apt.schedule && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(apt.schedule.startTime).toLocaleDateString()} @ {new Date(apt.schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* Directory Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Medical Practitioners Directory</h2>
          <p className="text-sm text-muted-foreground">Search and sort verified specialists available across clinical networks.</p>
        </div>
        <DoctorDirectory initialDoctors={verifiedDoctors} />
      </div>
    </div>
  );
}