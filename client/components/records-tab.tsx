"use client";

import { Video, MessageSquare, Calendar, Stethoscope, Pill, ClipboardList, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecordsTabProps {
  appointments: any[];
}

export function RecordsTab({ appointments }: RecordsTabProps) {
  // Filter for appointments that actually contain medical records attached by doctors
  const compiledRecords = appointments.filter((apt) => apt.medicalRecord);

  if (compiledRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-2xl bg-muted/5 min-h-[260px]">
        <FileWarning size={32} className="text-muted-foreground/40 mb-2" />
        <h3 className="text-xs font-bold text-foreground">No Diagnostics Cataloged</h3>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
          Your practitioners have not published clinical logs or active prescription charts to this timeline yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {compiledRecords.map((apt) => {
        const isVideo = apt.modality?.toLowerCase() === "video";
        const doctorName = apt.doctor ? `${apt.doctor.firstName} ${apt.doctor.lastName}` : "Medical Specialist";

        return (
          <Card key={apt.id} className="border border-border/50 shadow-none bg-card rounded-xl overflow-hidden">
            {/* Context Header Top Bar */}
            <CardHeader className="bg-muted/30 p-4 border-b border-border/40 flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center border",
                  isVideo ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" : "bg-blue-500/10 text-blue-600 border-blue-500/10"
                )}>
                  {isVideo ? <Video size={16} /> : <MessageSquare size={16} />}
                </div>
                <div>
                  <CardTitle className="text-sm font-black text-foreground">Dr. {doctorName}</CardTitle>
                  <p className="text-[11px] text-muted-foreground font-medium">{apt.doctor?.specialization || "General Practice"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border/50">
                <Calendar size={12} className="text-primary" />
                <span>{apt.schedule?.date || "N/A"}</span>
                <span className="opacity-40">|</span>
                <span>{apt.schedule?.time || "N/A"}</span>
              </div>
            </CardHeader>

            {/* Diagnostics and Treatment Layout Panels */}
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Consultation Notes */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border/40 bg-muted/5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ClipboardList size={14} className="text-primary" />
                  Clinical Assessment Notes
                </h5>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                  {apt.medicalRecord.consultationNotes || "No specific diagnostics documented."}
                </p>
              </div>

              {/* Prescriptions */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border/40 bg-muted/5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Pill size={14} className="text-primary" />
                  Prescribed Medication Chart
                </h5>
                {apt.medicalRecord.prescriptions ? (
                  <p className="text-xs font-mono text-foreground/90 bg-background border rounded-lg p-2.5 leading-relaxed whitespace-pre-line">
                    {apt.medicalRecord.prescriptions}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic pt-1">No medication lines issued for this tracking interval.</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}