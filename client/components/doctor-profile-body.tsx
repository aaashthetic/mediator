"use client";

import { BookingModal } from "@/components/modals/booking-modal";
import { Sparkles, ShieldCheck, Clock } from "lucide-react";

interface DoctorProfileBodyProps {
  doctor: any;
}

export function DoctorProfileBody({ doctor }: DoctorProfileBodyProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
      
      {/* Left Stack: Deep Biography Narrative */}
      <div className="md:col-span-2 space-y-8">
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-primary/80" />
            <span>About Practitioner</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line antialiased">
            {doctor.bio || "No clinical biography provided by the practitioner."}
          </p>
        </div>

        {/* Dynamic Care Quality Indicators added to ground the layout without using box wrappers */}
        <div className="pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex gap-2.5">
            <ShieldCheck size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Verified Medical Practitioner</p>
              <p className="mt-0.5 leading-normal">Credentials checked and verified by clinical standards board workflows.</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <Clock size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Flexible Scheduling</p>
              <p className="mt-0.5 leading-normal">Book, reschedule, or manage digital consultation segments from your portal.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Stack: Unboxed Sticky Booking Sidebar */}
      <div className="relative">
        <div className="md:sticky md:top-8 space-y-6 pb-6 border-t md:border-t-0 md:border-l md:border-border/60 md:pl-8 pt-6 md:pt-0">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Consultation Rate
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-foreground">
                  ₱{Number(doctor.consultationFee || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-muted-foreground font-medium">/ session</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                Includes session documentation logs, digital prescription entries, and secure messaging channels.
              </p>
            </div>
          </div>

          {/* Client-Side Booking Action Hook Trigger */}
          <div className="pt-2">
            <BookingModal doctor={doctor} />
          </div>
        </div>
      </div>

    </div>
  );
}