import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DoctorProfileHeader } from "@/components/doctor-profile-header";
import { DoctorProfileBody } from "@/components/doctor-profile-body";

interface DoctorPageProps {
  params: Promise<{ docId: string }>;
}

export default async function DoctorProfilePage({ params }: DoctorPageProps) {
  const { docId } = await params;
  const { userId: patientClerkId, getToken } = await auth();

  // Route security layer verification check
  if (!patientClerkId) {
    console.error("Clerk Authentication failed: No active session found.");
    notFound();
  }

  let doctorDetails = null;

  try {
    const token = await getToken();

    if (token) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
      // Fetch data directly from Express endpoint microservice
      const response = await fetch(`${apiBaseUrl}/api/doctors/${docId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 }, // Bypasses Next caches to ensure live appointment slots are valid
      });

      if (response.ok) {
        const data = await response.json();
        doctorDetails = data.doctor;
      }
    }
  } catch (error) {
    console.error("Failed to hydrate page from doctor profile API:", error);
  }

  // Final confirmation error barrier catch
  if (!doctorDetails) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <DoctorProfileHeader doctor={doctorDetails} />

      {/* Body Section */}
      <DoctorProfileBody doctor={doctorDetails} />
    </div>
  );
}