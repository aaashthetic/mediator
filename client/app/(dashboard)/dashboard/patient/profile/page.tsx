import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import PatientProfileForm from "@/components/patient-profile-form";

export const revalidate = 0;

export default async function PatientProfilePage() {
  const { userId, getToken } = await auth();
  if (!userId) redirect("/sign-in");

  const token = await getToken();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  let patientData = null;

  try {
    const res = await fetch(`${apiBaseUrl}/api/patients`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      patientData = data.patient;
    }
  } catch (error) {
    console.error("Failed to fetch patient records profile payload:", error);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
          <User className="text-blue-500" size={28} />
          <span>Patient Demographics File</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Update vital diagnostic references, standard biometric metrics, contact parameters, and medical histories.
        </p>
      </div>

      <PatientProfileForm initialData={patientData} />
    </div>
  );
}