
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Calendar, Users, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Appointment {
  id: string;
  status: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  schedule?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export default async function DoctorHub() {
  const { userId, getToken } = await auth();

  if (!userId) {
    notFound();
  }

  let doctorAppointments: Appointment[] = [];
  let totalAppointments = 0;
  let totalPatients = 0;
  let pendingSchedules = 0;

  try {
    const token = await getToken();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    // Fetch doctor's appointments
    const appointmentsResponse = await fetch(
      `${apiBaseUrl}/api/appointments?role=doctor&userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (appointmentsResponse.ok) {
      const appointmentData = await appointmentsResponse.json();
      doctorAppointments = (appointmentData.appointments || [])
        .filter((apt: Appointment) => apt.status === "confirmed")
        .slice(0, 5);

      totalAppointments = appointmentData.meta?.totalItems || 0;

      // Count unique patients
      const uniquePatients = new Set(
        (appointmentData.appointments || []).map((apt: Appointment) => apt.patient?.id)
      );
      totalPatients = uniquePatients.size;
    }

    // Fetch doctor's schedules to get pending count
    const schedulesResponse = await fetch(
      `${apiBaseUrl}/api/doctor-schedules?doctorId=${userId}&includeBooked=false`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (schedulesResponse.ok) {
      const scheduleData = await schedulesResponse.json();
      pendingSchedules = (scheduleData.schedules || []).length;
    }
  } catch (error) {
    console.error("Failed to hydrate doctor dashboard:", error);
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-primary to-primary/70 rounded-2xl text-primary-foreground shadow-md animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
        <h1 className="text-2xl font-bold">Welcome back to MEDiator!</h1>
        <p className="mt-1 opacity-90 text-sm">
          Manage your availability, review patient appointments, and optimize your clinical schedule.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-backwards">
        {/* Total Appointments */}
        <div className="bg-card text-card-foreground border p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Total Appointments
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">{totalAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary/40" />
          </div>
        </div>

        {/* Active Patients */}
        <div className="bg-card text-card-foreground border p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Active Patients
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">{totalPatients}</p>
            </div>
            <Users className="h-8 w-8 text-emerald-500/40" />
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-card text-card-foreground border p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Available Slots
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">{pendingSchedules}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500/40" />
          </div>
        </div>

        {/* Quick Action */}
        <Link
          href="/dashboard/doctor/schedule"
          className="bg-card text-card-foreground border p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Manage Schedule
            </p>
            <p className="text-sm font-bold text-primary mt-2 group-hover:underline">
              Set availability →
            </p>
          </div>
          <AlertCircle className="h-8 w-8 text-primary/40 group-hover:text-primary/60 transition" />
        </Link>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-card text-card-foreground border p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" /> Upcoming Appointments
          </h2>
          <Link
            href="/dashboard/doctor/appointments"
            className="text-xs font-bold text-primary hover:underline"
          >
            View All →
          </Link>
        </div>

        {doctorAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
            No confirmed appointments scheduled at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {doctorAppointments.map((apt, index) => (
              <div
                key={apt.id}
                className="flex justify-between items-center p-3 bg-muted/40 rounded-lg border"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {apt.patient?.firstName} {apt.patient?.lastName}
                  </p>
                  {apt.schedule && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {apt.schedule.date} • {apt.schedule.startTime} - {apt.schedule.endTime}
                    </p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/doctor/appointments"
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 rounded-xl hover:shadow-md transition-all duration-300 group"
        >
          <Calendar className="text-primary h-6 w-6 mb-2 group-hover:scale-110 transition" />
          <h3 className="font-bold text-foreground">Manage Appointments</h3>
          <p className="text-xs text-muted-foreground mt-1">
            View all appointments, reschedule, or cancel consultations.
          </p>
        </Link>

        <Link
          href="/dashboard/doctor/schedule"
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-6 rounded-xl hover:shadow-md transition-all duration-300 group"
        >
          <Clock className="text-emerald-600 h-6 w-6 mb-2 group-hover:scale-110 transition" />
          <h3 className="font-bold text-foreground">Set Availability</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add time slots and manage your clinical availability.
          </p>
        </Link>
      </div>
    </div>
  );
}