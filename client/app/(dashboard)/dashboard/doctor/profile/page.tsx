import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import DoctorProfileForm from "@/components/doctor-profile-form";

export const revalidate = 0;

export default async function DoctorProfilePage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();
  const clerkUser = await currentUser();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  let doctorData = null;

  try {
    const res = await fetch(`${apiBaseUrl}/api/doctors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      doctorData = data.doctor;
    }
  } catch (error) {
    console.error("Failed to fetch doctor profile database record:", error);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
          <ShieldCheck className="text-emerald-500" size={28} />
          <span>Professional Practitioner Profile</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your clinical specializations, consultation pricing, bio details, and account validation metrics.
        </p>
      </div>

      <DoctorProfileForm initialData={doctorData} />
    </div>
  );
}