import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Clock, History, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentsList } from "@/components/appointments-list";

export const revalidate = 0; // Bypass cache to ensure up-to-date schedule status mutations

export default async function PatientAppointmentsPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    notFound();
  }

  let upcomingAppointments = [];
  let pastAppointments = [];

  try {
    const token = await getToken();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const response = await fetch(`${apiBaseUrl}/api/appointments?role=patient&userId=${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const allAppointments = data.appointments || [];
      console.log("RAW BACKEND PAYLOAD METRICS:", JSON.stringify(data, null, 2));
      
      // Separate records cleanly based on operational status configurations
      upcomingAppointments = allAppointments.filter(
        (apt: any) => apt.status === "pending" || apt.status === "confirmed"
      );
      pastAppointments = allAppointments.filter(
        (apt: any) => apt.status === "completed" || apt.status === "cancelled"
      );
    }
  } catch (error) {
    console.error("Failed to hydrate patient appointment dashboard logs:", error);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="flex flex-col gap-1 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
          <CalendarDays className="text-primary" size={28} />
          <span>Appointments</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Track clinical logs, manage active time slots, or initialize real-time telehealth connections.
        </p>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="upcoming" className="w-full space-y-6">
        <TabsList className="bg-muted/40 border border-border/60 p-1 rounded-xl w-full flex flex-row sm:h-11 gap-1">
  
          <TabsTrigger
            value="upcoming"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider px-2 py-2 sm:py-0"
          >
            <Clock size={14} />
            <span className="leading-none text-center">
              Upcoming ({upcomingAppointments.length})
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="past"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider px-2 py-2 sm:py-0"
          >
            <History size={14} />
            <span className="leading-none text-center">
              Past ({pastAppointments.length})
            </span>
          </TabsTrigger>

        </TabsList>

        <TabsContent value="upcoming" className="outline-none w-full">
          <AppointmentsList appointments={upcomingAppointments} type="UPCOMING" />
        </TabsContent>

        <TabsContent value="past" className="outline-none w-full">
          <AppointmentsList appointments={pastAppointments} type="PAST" />
        </TabsContent>
      </Tabs>
    </div>
  );
}