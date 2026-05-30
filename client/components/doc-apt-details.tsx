"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DocAptDetailsProps {
  appointment: any;
  appointmentId: string;
  doctorId: string;
}

export function DocAptDetails({
  appointment,
  appointmentId,
  doctorId,
}: DocAptDetailsProps) {
  const { getToken } = useAuth();
  const [consultationNotes, setConsultationNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (appointment.medicalRecord) {
      setConsultationNotes(appointment.medicalRecord.consultationNotes || "");
      setPrescriptions(appointment.medicalRecord.prescriptions || "");
    }
  }, [appointment]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${apiBaseUrl}/api/appointments/${appointmentId}/notes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consultationNotes,
            prescriptions,
          }),
        }
      );

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/doctor/appointments">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Consultation Notes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: {appointment.patient?.firstName}{" "}
              {appointment.patient?.lastName}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "text-[9px] font-extrabold uppercase tracking-widest px-3 py-1",
            appointment.status === "confirmed" &&
              "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 border",
            appointment.status === "pending" &&
              "bg-amber-500/10 border-amber-500/20 text-amber-600 border",
            appointment.status === "completed" &&
              "bg-blue-500/10 border-blue-500/20 text-blue-600 border",
            appointment.status === "cancelled" &&
              "bg-destructive/10 border-destructive/20 text-destructive border"
          )}
        >
          {appointment.status}
        </Badge>
      </div>

      {/* Appointment Summary */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-base font-semibold text-foreground">
                {appointment.schedule?.date || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="text-base font-semibold text-foreground">
                {appointment.schedule?.startTime || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Modality
              </p>
              <p className="text-base font-semibold text-foreground capitalize">
                {appointment.modality || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fee</p>
              <p className="text-base font-semibold text-foreground">
                ₱{Number(appointment.doctor?.consultationFee || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Medical History */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Patient Medical Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Height
              </p>
              <p className="text-base font-semibold text-foreground">
                {appointment.patient?.height || "N/A"} cm
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Weight
              </p>
              <p className="text-base font-semibold text-foreground">
                {appointment.patient?.weight || "N/A"} kg
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Medical History
            </p>
            <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg">
              {appointment.patient?.basicMedicalHistory ||
                "No medical history recorded."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consultation Notes */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Consultation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Clinical Observations & Findings
            </label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Document your clinical findings, observations, and diagnostic assessments here..."
              className="w-full min-h-[200px] px-3 py-2 text-sm border border-border/50 rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Prescriptions & Treatment Plan
            </label>
            <textarea
              value={prescriptions}
              onChange={(e) => setPrescriptions(e.target.value)}
              placeholder="Document prescribed medications, dosage, and treatment instructions..."
              className="w-full min-h-[150px] px-3 py-2 text-sm border border-border/50 rounded-lg bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-sm font-medium">
              ✓ Notes saved successfully
            </div>
          )}

          <Button
            onClick={handleSaveNotes}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Saving Notes...
              </>
            ) : (
              <>
                <Save size={14} className="mr-2" />
                Save Consultation Notes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
