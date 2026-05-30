"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UploadCloud, FileText, Trash2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServerDocument {
  id: string;
  name: string;
  size: string;
  date: string;
  fileUrl: string;
}

interface UploadsTabProps {
  userId: string;
  apiBaseUrl: string;
  initialDocuments: ServerDocument[];
}

export function UploadsTab({ userId, apiBaseUrl, initialDocuments }: UploadsTabProps) {
  // Manage an explicit single local file selection or null state
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ status: "SUCCESS" | "ERROR"; msg: string } | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<ServerDocument[]>(initialDocuments);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFeedback(null);
    }
  };

  const executeDocumentUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setFeedback(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("materials", selectedFile);
      formData.append("patientId", userId);

      // API route
      const response = await fetch(`${apiBaseUrl}/api/documents`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed transmission pipeline handshakes.");
      }

      // Add fresh document records
      setUploadedDocuments((prev) => [data.document, ...prev]);
      setSelectedFile(null);
      setFeedback({ status: "SUCCESS", msg: data.message || "File uploaded successfully!" });
    } catch (err: any) {
      setFeedback({ status: "ERROR", msg: err.message || "An error occurred while uploading the file." });
    } finally {
      setIsUploading(false);
    }
  };

  const executeDocumentDeletion = async (documentId: string) => {
    setIsDeletingId(documentId);
    setFeedback(null);

    try {
      // API Route
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not process asset wipe sequences.");
      }

      setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      setFeedback({ status: "SUCCESS", msg: "Document removed successfully." });
    } catch (err: any) {
      setFeedback({ status: "ERROR", msg: err.message || "Failed to release structural file records." });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Upload Handler Interaction Control Node */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-5 border border-border/60 rounded-xl bg-card space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Attach Health Material</h4>
            <p className="text-[11px] text-muted-foreground">Upload a medical slip, lab panel summary, or imaging record securely.</p>
          </div>

          {/* Interactive Drag & Drop Area */}
          <label className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/5 transition-all group min-h-[160px]">
            <input type="file" className="hidden" onChange={handleFileSelection} disabled={isUploading} accept=".pdf,.png,.jpg,.jpeg" />
            <UploadCloud size={28} className="text-muted-foreground group-hover:text-primary transition-colors mb-2" />
            <span className="text-xs font-bold text-foreground">Browse local directory</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, PNG, JPG files</span>
          </label>

          {/* Queue List UI Handler Section */}
          {selectedFile && (
            <div className="space-y-2 border-t border-border/40 pt-3 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">File</span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px]">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText size={14} className="text-primary flex-shrink-0" />
                    <span className="font-medium text-foreground truncate">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive p-0.5 transition-colors" disabled={isUploading}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <Button size="sm" onClick={executeDocumentUpload} disabled={isUploading} className="w-full rounded-lg text-xs font-bold uppercase tracking-wider bg-primary mt-2">
                {isUploading ? (
                  <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Uploading...</span>
                ) : "Upload Document"}
              </Button>
            </div>
          )}

          {/* User Feedback Alerts */}
          {feedback && (
            <div className={cn(
              "flex items-start gap-2 p-3 rounded-xl border text-[11px] font-medium animate-in slide-in-from-top-1",
              feedback.status === "SUCCESS" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-destructive/10 border-destructive/20 text-destructive"
            )}>
              {feedback.status === "SUCCESS" ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents Grid View Manager */}
      <div className="lg:col-span-2 space-y-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Repository Assets</h4>
          <p className="text-[11px] text-muted-foreground">Overview of user's uploaded medical records.</p>
        </div>

        {uploadedDocuments.length === 0 ? (
          <div className="p-12 text-center border rounded-xl bg-card border-dashed text-xs text-muted-foreground">
            No medical documents logged in your registry database archive.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uploadedDocuments.map((doc) => (
              <Card key={doc.id} className="border border-border/50 shadow-none hover:border-border/100 bg-card rounded-xl overflow-hidden transition-all group">
                <CardContent className="p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-9 w-9 bg-primary/5 text-primary border border-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 space-y-0.5 flex-1">
                      {/* Renders down explicitly downloadable hyperlink hooks */}
                      <a href={doc.fileUrl} download={doc.name} target="_blank" rel="noreferrer" className="text-xs font-bold text-foreground block truncate hover:text-primary transition-colors">
                        {doc.name}
                      </a>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <span>{doc.size}</span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span>Uploaded {doc.date}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => executeDocumentDeletion(doc.id)}
                    disabled={isDeletingId !== null}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all p-1"
                  >
                    {isDeletingId === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}