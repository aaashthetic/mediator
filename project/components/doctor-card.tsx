"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Briefcase, Award, ChevronRight } from "lucide-react";

export function DoctorCard({ doctor }: { doctor: any }) {
  const router = useRouter();

  // Redirect link execution block using internal account record unique identifier strings
  const handleCardClick = () => {
    router.push(`/dashboard/patient/doctors/${doctor.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Header Card Info Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border bg-muted flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <Image
              src={doctor.profilePicture || "/placeholder-avatar.png"}
              alt={`Dr. ${doctor.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
              {doctor.specialization || "General Medicine"}
            </span>
          </div>
        </div>

        {/* Bio Text Description Column */}
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px] leading-relaxed">
          {doctor.bio || "No clinical biography provided by the practitioner at this time."}
        </p>
      </div>

      {/* Card Footer Boundary Block */}
      <div className="flex items-center justify-between pt-4 mt-6 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {/* Specialization Indicator Item */}
          <div className="flex items-center gap-1.5">
            <Briefcase size={14} className="text-primary/70" />
            <span className="font-medium truncate max-w-[120px]">
              {doctor.specialization || "General"}
            </span>
          </div>
          
          {/* Years of Experience Indicator Item */}
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-primary/70" />
            <span className="font-medium">
              {doctor.yearsExperience ? `${doctor.yearsExperience} yrs exp` : "New Practitioner"}
            </span>
          </div>
        </div>

        {/* Inline Slug Link Indicator Icon */}
        <div className="text-muted-foreground group-hover:text-primary transition-colors p-1">
          <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}