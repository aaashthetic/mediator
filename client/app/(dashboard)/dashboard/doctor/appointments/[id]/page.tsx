import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import { DocAptDetails } from "@/components/doc-apt-details";

export const revalidate = 0; // Bypass Next.js cache structures

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorAppointmentDetailsPage({ params }: PageProps) {
  const { userId, getToken } = await auth();
  const { id } = await params;

  if (!userId) {
    notFound();
  }

  let appointmentData = null;

  try {
    const token = await getToken();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

    const response = await fetch(`${apiBaseUrl}/api/appointments/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const payload = await response.json();
      appointmentData = payload.appointment;
    } else if (response.status === 404) {
      notFound();
    }
  } catch (error) {
    console.error("Critical error hydrating appointment context details:", error);
  }

  if (!appointmentData) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center text-sm text-muted-foreground animate-pulse">
        Synchronizing clinical appointment metrics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/doctor/appointments"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-1.5 text-[10px] font-mono bg-muted px-2.5 py-1 rounded-md text-muted-foreground border">
          <Activity size={12} className="text-emerald-500 animate-pulse" />
          ID: {appointmentData.id}
        </div>
      </div>

      {/* Main Treatment Deck Component Wrapper */}
      <DocAptDetails appointment={appointmentData} appointmentId={id} doctorId={userId} />
    </div>
  );
}