import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { FolderHeart, FileText, UploadCloud } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordsTab } from "@/components/records-tab";
import { UploadsTab } from "@/components/uploads-tab";

export const revalidate = 0; // Bypass cache for instant sync updates

export default async function MedicalRecordsPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    notFound();
  }

  let documents = [];
  const token = await getToken();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  try {
    const documentRes = await fetch(`${apiBaseUrl}/api/documents?role=patient&userId=${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (documentRes.ok) {
      const data = await documentRes.json();
      documents = data.documents || [];
    }
  } catch (error) {
    console.error("Failed to hydrate medical database engine records:", error);
  }

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

      {/* Synchronized Tabs Segment */}
      <Tabs defaultValue="clinical" className="w-full space-y-6">
        <TabsList className="bg-muted/40 border border-border/60 p-1 rounded-xl w-full flex flex-row sm:h-11 gap-1">
          <TabsTrigger value="clinical" className="flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider px-2 py-2 sm:py-0">
            <FileText size={14} />
            Records
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider px-2 py-2 sm:py-0">
            <UploadCloud size={14} />
            Uploads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="outline-none w-full">
          <RecordsTab appointments={documents} />
        </TabsContent>

        <TabsContent value="documents" className="outline-none w-full">
          <UploadsTab userId={userId} apiBaseUrl={apiBaseUrl} initialDocuments={documents}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}