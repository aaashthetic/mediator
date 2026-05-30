"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MoreVertical, CalendarClock, Ban, Loader2, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DocActionMenu({ appointment }: { appointment: any }) {
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [activeModal, setActiveModal] = useState<"NONE" | "RESCHEDULE" | "CANCEL">("NONE");
  const [isMutating, setIsMutating] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Wraps event executions cleanly to protect outer Row Link configurations
  const executeModalOpen = async (e: React.MouseEvent, target: "RESCHEDULE" | "CANCEL") => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fetch full appointment details if opening reschedule modal
    if (target === "RESCHEDULE") {
      setLoadingDetails(true);
      try {
        const token = await getToken();
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${apiBaseUrl}/api/appointments/${appointment.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAppointmentDetails(data.appointment);
        }
      } catch (err) {
        console.error("Failed to load appointment details:", err);
      } finally {
        setLoadingDetails(false);
      }
    }
    
    setActiveModal(target);
  };

  const handleCancellation = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMutating(true);
    try {
      const token = await getToken();
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiBaseUrl}/api/appointments/${appointment.id}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) throw new Error("Mutation rejected");

      router.refresh();
      setActiveModal("NONE");
    } catch (err) {
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleReschedule = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedNewSlot) return;
    setIsMutating(true);
    try {
      const token = await getToken();
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiBaseUrl}/api/appointments/${appointment.id}/reschedule`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scheduleId: selectedNewSlot })
      });

      if (!response.ok) throw new Error("Mutation rejected");

      router.refresh();
      setActiveModal("NONE");
    } catch (err) {
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    // Click events are intercepted here to isolate the root card from triggering unwanted navigation redirects
    <div className="absolute top-2.5 right-2.5 z-20" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Pinned flat ghost interaction layout configuration option */}
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-transparent border-0 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 focus-visible:ring-0">
            <MoreVertical size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1 rounded-lg shadow-md border border-border/40">
          <DropdownMenuItem onClick={(e) => executeModalOpen(e, "RESCHEDULE")} className="text-xs font-medium py-1.5 rounded-md gap-2 cursor-pointer">
            <CalendarClock size={13} className="text-muted-foreground" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => executeModalOpen(e, "CANCEL")} className="text-xs font-bold text-destructive hover:!text-destructive hover:!bg-destructive/10 py-1.5 rounded-md gap-2 cursor-pointer">
            <Ban size={13} />
            Cancel Booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cancellation Dialog Window */}
      <Dialog open={activeModal === "CANCEL"} onOpenChange={(val) => !val && setActiveModal("NONE")}>
        <DialogContent className="sm:max-w-sm rounded-xl border border-border/80" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="text-left flex flex-col items-start gap-1.5">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive"><AlertTriangle size={16} /></div>
            <DialogTitle className="text-sm font-bold">Cancel Consultation Session?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-normal">
              Are you sure you want to cancel this session? This action will immediately release the slot lock reservation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-1.5 sm:gap-0 pt-1.5">
            <Button variant="outline" size="sm" disabled={isMutating} onClick={() => setActiveModal("NONE")} className="rounded-lg text-[11px] font-bold uppercase tracking-wider h-8">Close</Button>
            <Button variant="destructive" size="sm" disabled={isMutating} onClick={handleCancellation} className="rounded-lg text-[11px] font-bold uppercase tracking-wider h-8">
              {isMutating ? <Loader2 size={12} className="animate-spin" /> : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rescheduling Dialog Window */}
      <Dialog open={activeModal === "RESCHEDULE"} onOpenChange={(val) => !val && setActiveModal("NONE")}>
        <DialogContent className="sm:max-w-md rounded-xl border border-border/80" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="text-left">
            <DialogTitle className="text-sm font-bold">Reschedule Consultation</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Select an alternative consultation slot configuration provided by the practitioner.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2.5 max-h-44 overflow-y-auto grid grid-cols-2 gap-1.5">
            {loadingDetails ? (
              <p className="text-[11px] text-muted-foreground col-span-2 text-center py-4">Loading available slots...</p>
            ) : appointmentDetails?.doctor?.availableSlots && appointmentDetails.doctor.availableSlots.length > 0 ? (
              appointmentDetails.doctor.availableSlots
                .filter((s: any) => !s.isBooked)
                .map((slot: any) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedNewSlot(slot.id)}
                    className={`p-2 rounded-md border text-[11px] font-medium text-center transition-all ${
                      selectedNewSlot === slot.id 
                        ? "border-primary bg-primary/10 text-primary font-bold" 
                        : "border-border/50 hover:border-border/80 text-foreground bg-muted/5"
                    }`}
                  >
                    {slot.date} @ {slot.time}
                  </button>
                ))
            ) : (
              <p className="text-[11px] text-muted-foreground col-span-2 text-center py-4">No alternative slots available.</p>
            )}
          </div>

          <DialogFooter className="flex gap-1.5 sm:gap-0 pt-1.5 border-t border-border/50">
            <Button variant="outline" size="sm" disabled={isMutating} onClick={() => setActiveModal("NONE")} className="rounded-lg text-[11px] font-bold uppercase tracking-wider h-8">Back</Button>
            <Button size="sm" disabled={isMutating || !selectedNewSlot} onClick={handleReschedule} className="rounded-lg text-[11px] font-bold uppercase tracking-wider bg-primary h-8">
              {isMutating ? <Loader2 size={12} className="animate-spin" /> : "Confirm Relocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}