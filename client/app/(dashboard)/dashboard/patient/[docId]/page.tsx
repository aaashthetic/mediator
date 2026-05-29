import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { DoctorProfileHeader } from "@/components/doctor-profile-header";
import { BookingModal } from "@/components/modals/booking-modal";

interface DoctorPageProps {
  params: Promise<{ docId: string }>;
}

export default async function DoctorProfilePage({ params }: DoctorPageProps) {
  const { docId } = await params;
  const { userId: patientClerkId } = await auth();

  // Route security check
  if (!patientClerkId) notFound();

  // Retrieve hydrated and calculated data from the endpoint
  let doctorDetails = null;

  try {
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    
    const response = await fetch(`${protocol}://${host}/api/dashboard/patient/${docId}`, {
      headers: await headers(), // Forwards authentication headers/cookies seamlessly
      next: { revalidate: 0 }    // Keeps data real-time for booking accuracy
    });

    if (response.status === 404) {
      notFound();
    }

    if (response.ok) {
      const data = await response.json();
      doctorDetails = data.doctor;
    }
  } catch (error) {
    console.error("Failed to hydrate page from doctor profile API:", error);
  }

  // Fallback if network or data retrieval steps failed entirely
  if (!doctorDetails) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Visual Identity Layout Header Component */}
      <DoctorProfileHeader doctor={doctorDetails} />

      {/* Main Narrative Split Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Core Description Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-3">About Practitioner</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {doctorDetails.bio}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4">Supported Modalities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctorDetails.services.map((svc: any) => (
                <div key={svc.id} className="border border-muted-foreground/20 rounded-xl p-4 bg-muted/5">
                  <h3 className="text-sm font-bold text-foreground capitalize">{svc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Sticky Sidebar Anchor */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between sticky top-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Rate</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black text-foreground">₱{doctorDetails.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">/ session</span>
              </div>
              <div className="h-[1px] bg-border/60 my-4" />
              <p className="text-xs text-muted-foreground leading-normal">
                Includes full session documentation logs, digital prescription entry permissions, and 48-hour follow-up message loops.
              </p>
            </div>

            {/* Client-Side Floating Modal Trigger Action */}
            <BookingModal doctor={doctorDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}