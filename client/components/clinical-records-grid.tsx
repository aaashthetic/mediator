"use client";

import { useState } from "react";
import { FileMedical, User, Calendar, ArrowRight, Stethoscope, Pill, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface GridProps {
  appointments: any[];
}

export function ClinicalRecordsGrid({ appointments }: GridProps) {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-2xl bg-muted/5 min-h-[220px] animate-in fade-in duration-200">
        <FileMedical size={32} className="text-muted-foreground/40 mb-2" />
        <h3 className="text-xs font-bold text-foreground">No Records Released</h3>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
          There are currently no finalized clinical summaries or active prescriptions pushed to this medical vault.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* High Density Small Card Grid Map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {appointments.map((apt) => {
          const doctorName = apt.doctor 
            ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}` 
            : "Medical Practitioner";
          
          // Formats creation metric dates safely
          const rawDate = apt.medicalRecord?.createdAt || apt.createdAt;
          const formattedDate = rawDate 
            ? new Date(rawDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
            : "N/A";

          return (
            <Card 
              key={apt.id} 
              className="group border border-border/50 shadow-none bg-card hover:border-border/100 hover:bg-muted/10 transition-all rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {/* Micro Metadata Headers */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0 bg-primary/5 text-primary border-primary/10">
                      Encounter Note
                    </Badge>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium font-mono">
                      <Calendar size={11} className="text-muted-foreground/70" />
                      {formattedDate}
                    </div>
                  </div>

                  {/* Main Clinical Author Text Details */}
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-foreground tracking-tight flex items-center gap-1.5">
                      <User size={13} className="text-muted-foreground/80 flex-shrink-0" />
                      <span className="truncate">{doctorName}</span>
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide truncate">
                      {apt.doctor?.specialization || "General Medicine"}
                    </p>
                  </div>

                  {/* High Density Content Snippet Preview */}
                  <p className="text-[11px] text-muted-foreground/90 font-medium line-clamp-2 leading-relaxed bg-muted/20 p-2 rounded-lg border border-border/30 min-h-[40px]">
                    {apt.medicalRecord?.consultationNotes || "No summary notes provided."}
                  </p>
                </div>

                {/* Card Floor Action Triggers */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 mt-2">
                  <span className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase">
                    Ref: RX-{apt.id.toString().slice(0, 6).toUpperCase()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedRecord(apt)}
                    className="h-6 rounded-md font-bold text-[10px] uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5 px-2 flex items-center gap-1 group/btn"
                  >
                    Inspect File
                    <ArrowRight size={11} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unified Reading Dialog Overlay Panel */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        {selectedRecord && (
          <DialogContent className="w-full max-w-lg border border-border bg-background p-5 rounded-xl shadow-2xl space-y-4">
            <DialogHeader className="space-y-1 border-b pb-3">
              <DialogTitle className="text-base font-black tracking-tight flex items-center gap-2">
                <FileMedical className="text-primary" size={18} />
                Clinical Encounter File Details
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-medium">
                Issued by Dr. {selectedRecord.doctor?.firstName} {selectedRecord.doctor?.lastName} on{" "}
                {new Date(selectedRecord.medicalRecord?.createdAt || selectedRecord.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Consultation Summary Field Blocks */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Stethoscope size={13} className="text-emerald-500" />
                  Physician Assessment Summary
                </h4>
                <div className="p-3 border border-border/70 rounded-xl bg-muted/10 text-xs text-muted-foreground leading-relaxed font-medium max-h-[160px] overflow-y-auto">
                  {selectedRecord.medicalRecord?.consultationNotes || "No summary parameters declared."}
                </div>
              </div>

              {/* Prescriptions Block Output */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Pill size={13} className="text-blue-500" />
                  Prescribed Therapy & Orders (Rx)
                </h4>
                <div className="p-3 border border-border/70 rounded-xl bg-muted/5 font-mono text-xs text-foreground leading-relaxed whitespace-pre-line max-h-[140px] overflow-y-auto">
                  {selectedRecord.medicalRecord?.prescriptions || "No active prescriptions associated with this chart session log."}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSelectedRecord(null)}
                className="h-8 rounded-lg font-bold text-xs uppercase tracking-wider px-4"
              >
                Close File
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}