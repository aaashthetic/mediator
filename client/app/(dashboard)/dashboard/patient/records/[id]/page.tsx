import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { FolderHeart, FileText, UploadCloud } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicalRecordsGrid } from "@/components/clinical-records-grid";

export const revalidate = 0; // Bypass cache for instant sync updates

export default async function MedicalRecordsPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    notFound();
  }

  let appointments = [];
  let documents = [];
  
  const token = await getToken();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

  try {
    // Concurrently fetch historical encounter tracks and diagnostic file uploads
    const [appointmentsRes, documentRes] = await Promise.all([
      fetch(`${apiBaseUrl}/api/appointments?role=patient&userId=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }),
      fetch(`${apiBaseUrl}/api/documents?role=patient&userId=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    ]);

    if (appointmentsRes.ok) {
      const data = await appointmentsRes.json();
      appointments = data.appointments || [];
    }
    if (documentRes.ok) {
      const data = await documentRes.json();
      documents = data.documents || [];
    }
  } catch (error) {
    console.error("Failed to hydrate medical database engine records:", error);
  }

  // Filter out only appointments that contain completed medical prescriptions/notes
  const validClinicalRecords = appointments.filter((apt: any) => apt.medicalRecord);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Structural Header Panel */}
      <div className="flex flex-col gap-1 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl flex items-center gap-2.5">
          <FolderHeart className="text-primary" size={28} />
          <span>Health Repository</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Access historical consultation summaries, verified prescriptions, and patient diagnostic attachments.
        </p>
      </div>

      {/* Tabs Layout Engine */}
      <Tabs defaultValue="clinical" className="w-full space-y-6">
        <TabsList className="bg-muted/40 border border-border/60 p-1 rounded-xl w-full sm:w-[400px] flex flex-row h-10 gap-1">
          <TabsTrigger
            value="clinical"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <FileText size={14} />
            Clinical Notes ({validClinicalRecords.length})
          </TabsTrigger>
          <TabsTrigger
            value="uploads"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <UploadCloud size={14} />
            Lab Attachments ({documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="outline-none w-full">
          <ClinicalRecordsGrid appointments={validClinicalRecords} />
        </TabsContent>

        <TabsContent value="uploads" className="outline-none w-full">
          {/* Your separate uploads file component grid goes here */}
          <div className="text-xs font-medium text-muted-foreground p-6 border border-dashed rounded-xl text-center bg-muted/5">
            Lab attachment documents pipeline integrated.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}