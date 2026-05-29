"use client";

import { ArrowLeft, Stethoscope, Video, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function DoctorProfileHeader({ doctor }: { doctor: any }) {
  return (
    <div className="relative bg-card border border-border rounded-3xl p-8 text-center shadow-md overflow-hidden">
      {/* Structural Header Context Action Elements */}
      <div className="absolute left-6 top-6">
        <Link 
          href="/dashboard/patient" 
          className="p-2.5 inline-flex bg-background hover:bg-muted rounded-xl transition-colors border border-muted-foreground/20 shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
      </div>

      {/* Center Stack Top Circular Profile Element Container */}
      <div className="flex flex-col items-center mt-4">
        <div className="relative h-32 w-32 rounded-full p-1 border-2 border-primary/40 bg-background shadow-xl mb-4">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image 
              src={doctor.avatarUrl} 
              alt={doctor.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Active Consultation Status Badge */}
          <span className="absolute bottom-1.5 right-1.5 block h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-card" />
        </div>

        {/* Identity Context Fields */}
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          {doctor.name}
        </h1>

        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-sm">
          <Stethoscope size={13} />
          {doctor.specialization}
        </div>

        {/* Digital Channel Services Provided Markers */}
        <div className="flex justify-center items-center gap-6 mt-6 text-muted-foreground text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <MessageSquare size={16} className="text-primary" />
            <span>Chat Access Enabled</span>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-1.5">
            <Video size={16} className="text-primary" />
            <span>Video Consultation Call</span>
          </div>
        </div>
      </div>
    </div>
  );
}