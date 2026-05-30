"use client";

import { Video, MessageSquare, Calendar, BadgeAlert, ArrowUpRight, Receipt, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocActionMenu } from "@/components/doc-action-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ListProps {
  appointments: any[];
  type: "UPCOMING" | "PAST";
  viewerRole?: "doctor" | "patient";
}

export function DoctorAppointments({ appointments, type, viewerRole = "patient" }: ListProps) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-2xl bg-muted/5 min-h-[260px] animate-in fade-in duration-200">
        <BadgeAlert size={32} className="text-muted-foreground/50 mb-2" />
        <h3 className="text-xs font-bold text-foreground">No Records Documented</h3>
        <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
          There are currently no {type.toLowerCase()} consultation logs bound to this profile window.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {appointments.map((apt) => {
        // Fallback or explicit check for structural modality types
        const modality = apt.modality?.toLowerCase() || "video";
        const isVideo = modality === "video";
        
        // Show patient info when doctor views their appointments, doctor info when patient views
        const isViewedByDoctor = viewerRole === "doctor";
        const displayPerson = isViewedByDoctor ? apt.patient : apt.doctor;
        const title = isViewedByDoctor ? "Patient" : "Dr.";
        const specialization = isViewedByDoctor ? apt.patient?.basicMedicalHistory : apt.doctor?.specialization;
        
        const fee = Number(apt.doctor?.consultationFee || 0);
        const name = displayPerson 
          ? `${displayPerson.firstName} ${displayPerson.lastName}`
          : isViewedByDoctor ? "Patient" : "Medical Practitioner";

        // Fallbacks for detailed financial metadata tracks
        const paymentMode = (apt.paymentMethod || "GCash").toUpperCase();
        const invoiceNum = apt.invoiceNumber || `INV-${apt.id?.toString().slice(0, 8).toUpperCase()}`;

        const href = viewerRole === "doctor" ? `/dashboard/doctor/appointments/${apt.id}` : `/appointments/${apt.id}`;

        return (
          <Link href={href} key={apt.id} className="block group">
            <Card className="relative overflow-hidden border border-border/50 shadow-none hover:border-border/100 hover:bg-muted/20 transition-all bg-card rounded-xl touch-manipulation">
              <CardContent className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-2 sm:pr-10">
                {type !== "PAST" && (
                  <div className="absolute top-0.5 right-0.5">
                    <DocActionMenu appointment={apt} />
                  </div>
                )}
                {/* Profile Meta + Schedule Details Context Section */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Icon adjusts dynamically contextually based on Video vs Chat selection */}
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors",
                    isVideo 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10 group-hover:bg-emerald-500/15" 
                      : "bg-blue-500/10 text-blue-600 border-blue-500/10 group-hover:bg-blue-500/15"
                  )}>
                    {isVideo ? <Video size={18} /> : <MessageSquare size={18} />}
                  </div>
                  
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold tracking-tight text-foreground truncate">
                        {title} {name}
                      </h4>
                      {specialization && (
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 bg-muted/50 text-muted-foreground border-border/40">
                          {isViewedByDoctor ? "Medical History" : specialization}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Schedule Container Node: Outputs full layout dates, days, and duration frameworks */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap font-medium break-words">
                      <Calendar size={12} className="text-primary/60 flex-shrink-0" />
                      <span className="text-foreground/90">{apt.schedule?.date || "N/A"}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                      <span>{apt.schedule.startTime || "N/A"}</span>
                      {apt.schedule.endTime && (
                        <>
                          <span className="text-muted-foreground/50">-</span>
                          <span>{apt.schedule.endTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Flags & Ledger Accountability Fields */}
                <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border/40 text-xs w-full md:w-auto">
                  <div className="flex items-center md:flex-col md:items-end gap-2 md:gap-0.5">
                    <Badge className={cn(
                      "text-[9px] font-extrabold uppercase tracking-widest px-2 py-0 border shadow-none rounded-md",
                      apt.status === "confirmed" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
                      apt.status === "pending" && "bg-amber-500/10 border-amber-500/20 text-amber-600",
                      apt.status === "completed" && "bg-blue-500/10 border-blue-500/20 text-blue-600",
                      apt.status === "cancelled" && "bg-destructive/10 border-destructive/20 text-destructive"
                    )}>
                      {apt.status}
                    </Badge>
                  </div>

                  {/* Financial Metrics Stack */}
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 text-[11px] text-muted-foreground font-medium">
                    <span className="text-foreground font-bold text-xs">₱{fee.toFixed(2)}</span>
                    <span className="h-3 w-px bg-border/60 hidden sm:inline" />
                    <span className="flex items-center gap-1"><CreditCard size={11} /> {paymentMode || "N/A"}</span>
                    <span className="h-3 w-px bg-border/60 hidden sm:inline" />
                    <span className="flex items-center gap-1 text-muted-foreground/80"><Receipt size={11} /> {invoiceNum}</span>
                  </div>
                </div>

                {/* Inline Action Interceptor Blocks */}
                
                {type === "UPCOMING" && apt.status === "confirmed" && apt.roomUrl && (
                  <div className="w-full md:w-auto flex justify-end">
                  <div className="md:pl-2 w-full md:w-auto" onClick={(e) => e.preventDefault()}>
                    <Button asChild size="sm" className="h-7 rounded-md font-bold text-[10px] uppercase tracking-wider bg-primary hover:bg-primary/90 px-3 w-full md:w-auto shadow-none">
                      <Link href={apt.roomUrl} target="_blank">
                        Join Telehealth <ArrowUpRight size={12} className="ml-1" />
                      </Link>
                    </Button>
                  </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}