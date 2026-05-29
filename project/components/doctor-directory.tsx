"use client";

import { useState } from "react";
import { Search, Filter, X, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorCard } from "./doctor-card";

export function DoctorDirectory({ doctors }: { doctors: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  // Filter Logic matching string properties
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = 
      `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.bio || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = 
      specialtyFilter === "all" || 
      doc.specialization?.toLowerCase() === specialtyFilter.toLowerCase();

    return matchesSearch && matchesSpecialty;
  });

  // Dynamically build filtering attributes options array mapping
  const uniqueSpecialties = Array.from(
    new Set(doctors.map((d) => d.specialization).filter(Boolean))
  ) as string[];

  const hasFiltersApplied = searchQuery !== "" || specialtyFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Search and Filter Inputs Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          <Input
            placeholder="Search physicians by name, text profiles or bios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Select value={specialtyFilter} onValueChange={(value) => setSpecialtyFilter(value)}>
          <SelectTrigger className="w-full sm:w-48 h-10">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {uniqueSpecialties.map((spec) => (
              <SelectItem key={spec} value={spec.toLowerCase()}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter Diagnostics Metrics Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div>
          {hasFiltersApplied && (
            <span className="flex items-center gap-1.5">
              Filters applied • <button onClick={() => { setSearchQuery(""); setSpecialtyFilter("all"); }} className="underline hover:text-foreground">Clear adjustments</button>
            </span>
          )}
        </div>
        <div>
          Showing {filteredDoctors.length} of {doctors.length} operators
        </div>
      </div>

      {/* Cards Display Grid Output */}
      {filteredDoctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full py-16 border border-dashed rounded-xl bg-card">
          <Stethoscope className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <h3 className="text-base font-semibold text-foreground">No doctors match your criteria</h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs mt-1">Try broadening your parameters or modifying text input terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}