"use client";

import { useState } from "react";
import { UploadCloud, FileText, Trash2, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadsTabProps {
  userId: string;
  token: string | null;
  apiBaseUrl: string;
}

export function UploadsTab({ userId, token, apiBaseUrl }: UploadsTabProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ status: "SUCCESS" | "ERROR"; msg: string } | null>(null);

  // Simulated Document Grid State for UI display tracking
  const [uploadedDocuments, setUploadedDocuments] = useState([
    { id: "1", name: "CBC_BloodTest_Results.pdf", size: "2.4 MB", date: "May 12, 2026" },
    { id: "2", name: "Chest_XRay_Report.jpg", size: "4.1 MB", date: "Apr 28, 2026" }
  ]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setFeedback(null);
    }
  };

  const removeFileFromQueue = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const executeDocumentBatchUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setFeedback(null);

    // Mocking asynchronous network delays matching structural server environments
    try {
      // Setup payload matching standard multi-part submission endpoints
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("materials", file));

      // Append code here for your actual file-upload API call if connected:
      // await fetch(`${apiBaseUrl}/api/documents/upload`, { ... })

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Injecting simulated responses back into tracking layout array grids
      const newItems = selectedFiles.map((file, idx) => ({
        id: Math.random().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
      }));

      setUploadedDocuments((prev) => [...newItems, ...prev]);
      setSelectedFiles([]);
      setFeedback({ status: "SUCCESS", msg: "All material packages compiled and authorized successfully." });
    } catch (err) {
      setFeedback({ status: "ERROR", msg: "Pipeline break detected during encryption handshake logs." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Upload Handler Interaction Control Node */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-5 border border-border/60 rounded-xl bg-card space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Attach Health Materials</h4>
            <p className="text-[11px] text-muted-foreground">Upload medical slips, lab panel summaries, or imaging records securely.</p>
          </div>

          {/* Interactive Drag & Drop Area */}
          <label className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/5 transition-all group min-h-[160px]">
            <input type="file" multiple className="hidden" onChange={handleFileSelection} disabled={isUploading} accept=".pdf,.png,.jpg,.jpeg" />
            <UploadCloud size={28} className="text-muted-foreground group-hover:text-primary transition-colors mb-2" />
            <span className="text-xs font-bold text-foreground">Browse local directory</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, PNG, JPG files</span>
          </label>

          {/* Queue List UI Handler Section */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2 border-t border-border/40 pt-3 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">File ({selectedFiles.length})</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40 text-[11px]">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText size={14} className="text-primary flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFileFromQueue(idx)} className="text-muted-foreground hover:text-destructive p-0.5 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <Button size="sm" onClick={executeDocumentBatchUpload} disabled={isUploading} className="w-full rounded-lg text-xs font-bold uppercase tracking-wider bg-primary mt-2">
                {isUploading ? (
                  <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Transmitting...</span>
                ) : "Upload Documents"}
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
          <p className="text-[11px] text-muted-foreground">Historical ledger overview tracking user-compiled attachments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {uploadedDocuments.map((doc) => (
            <Card key={doc.id} className="border border-border/50 shadow-none hover:border-border/100 bg-card rounded-xl overflow-hidden transition-all group">
              <CardContent className="p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 bg-primary/5 text-primary border border-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{doc.name}</h5>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <span>{doc.size}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span>Uploaded {doc.date}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}