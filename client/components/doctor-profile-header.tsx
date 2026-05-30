"use client";

import { ArrowLeft, Stethoscope, Video, MessageSquare, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function DoctorProfileHeader({ doctor }: { doctor: any }) {
  return (
    <div className="relative w-full py-10 bg-transparent">
      {/* Back Action Anchor */}
      <div className="mb-8">
        <Link 
          href="/dashboard/patient" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to directory</span>
        </Link>
      </div>

      {/* Split Asymmetric Layout: Left/Center Profile Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-8 pb-8 border-b border-border">
        
        {/* Left Side: Avatar & Name details Group */}
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          {/* Avatar frame with subtle double-ring elegance */}
          <div className="relative h-28 w-28 rounded-full ring-4 ring-background p-1 bg-muted flex-shrink-0 shadow-sm">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image 
                src={doctor.profilePicture} 
                alt={`Dr. ${doctor.lastName}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 112px, 224px"
              />
            </div>
            {/* Status indicator pill anchor */}
            <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-background" />
          </div>

          {/* Name & Core Credentials Metadata Stack */}
          <div className="space-y-2 mt-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
              {/* Specialization tag */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-primary/5 text-primary border border-primary/10">
                <Stethoscope size={13} />
                {doctor.specialization}
              </span>

              {/* Dynamic Experience Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border">
                <Award size={13} className="text-muted-foreground/80" />
                <span>
                  {typeof doctor.yearsOfExperience === 'number' && doctor.yearsOfExperience > 0 
                    ? `${doctor.yearsOfExperience} Years Experience` 
                    : "New Practitioner"
                  }
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Header Communication Modalities */}
        <div className="flex flex-col items-center md:items-end gap-3 mt-4 md:mt-2 text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Available Channels
          </span>
          <div className="flex items-center gap-4 text-xs font-medium text-foreground/80 bg-muted/40 p-2 px-4 rounded-xl border border-border/40">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-500" />
              <span>Chat</span>
            </div>
            <div className="h-3 w-[1px] bg-border" />
            <div className="flex items-center gap-2">
              <Video size={14} className="text-primary" />
              <span>Video Consultation</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}