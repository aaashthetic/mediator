"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MessageSquare, Video, Calendar, CreditCard, ChevronRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = "SERVICE" | "SCHEDULE" | "PAYMENT" | "SUCCESS";

interface BookingModalProps {
  doctor: any;
  onSuccess?: () => void;
}

export function BookingModal({ doctor, onSuccess }: BookingModalProps) {
  const { getToken } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("SERVICE");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "maya" | "card" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetFlow = () => {
    setStep("SERVICE");
    setSelectedService(null);
    setSelectedSlot(null);
    setPaymentMethod(null);
    setIsProcessing(false);
    setErrorMessage(null);
  };

  const handlePaymentExecution = async () => {
    if (!paymentMethod || !selectedSlot) return;
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      // Fetch active session token from Clerk JWT cache
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication session has expired. Please re-login.");
      }

      // Point to  designated Express port environment variable 
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${apiBaseUrl}/api/appointments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          scheduleId: selectedSlot.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unexpected reservation break occurred.");
      }

      router.refresh(); 
      if (onSuccess) onSuccess();
      
      setStep("SUCCESS");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to finalize connection pipeline.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "SERVICE": return "Select your preferred consultation channel to connect with your practitioner.";
      case "SCHEDULE": return "Choose an available date and time slot that fits your schedule.";
      case "PAYMENT": return "Review your appointment breakdown and select a secure payment method.";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetFlow(); }}>
      <DialogTrigger asChild>
        <Button className="w-full mt-6 h-11 rounded-xl font-bold uppercase tracking-wider text-xs bg-primary shadow-md hover:opacity-95 transition-all">
          Book Consultation
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md border border-border/80 shadow-2xl p-6">
        <DialogHeader className="text-left pb-2 border-b border-border/60">
          <DialogTitle className="text-lg font-bold text-foreground">Book Consultation</DialogTitle>
          {step !== "SUCCESS" && (
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {getStepDescription()}
            </DialogDescription>
          )}
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs mt-3 animate-in fade-in duration-150">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {step === "SERVICE" && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Channel Modality</label>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setSelectedService("chat"); setStep("SCHEDULE"); }}
                className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/30 hover:border-primary bg-card text-left transition-all group hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><MessageSquare size={20} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Secure Live Chat</h4>
                    <p className="text-xs text-muted-foreground">Synchronous text consultation panel</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => { setSelectedService("video"); setStep("SCHEDULE"); }}
                className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/30 hover:border-primary bg-card text-left transition-all group hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Video size={20} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">HD Video Stream Conference</h4>
                    <p className="text-xs text-muted-foreground">Real-time telehealth face-to-face panel</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        )}

        {step === "SCHEDULE" && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Available Appointment Time</label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {doctor.availableSlots?.map((slot: any) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "p-3 text-center rounded-xl border transition-all text-xs flex flex-col gap-1 items-center font-medium",
                    selectedSlot?.id === slot.id ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" : "border-muted-foreground/20 hover:border-muted-foreground/40 text-foreground bg-muted/5"
                  )}
                >
                  <Calendar size={14} className="opacity-70" />
                  <span>{slot.date}</span>
                  <span className="font-semibold opacity-90">{slot.time}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setStep("SERVICE")} className="flex-1 rounded-xl text-xs font-bold uppercase tracking-wider">Back</Button>
              <Button size="sm" disabled={!selectedSlot} onClick={() => setStep("PAYMENT")} className="flex-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary">Continue</Button>
            </div>
          </div>
        )}

        {step === "PAYMENT" && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <div className="rounded-xl bg-muted/20 border p-3 text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between font-medium">
                <span className="capitalize">{selectedService} Telehealth Consultation</span>
                <span className="font-bold text-foreground">₱{Number(doctor.consultationFee || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Scheduled Slot</span>
                <span className="text-foreground font-medium">{selectedSlot?.date} @ {selectedSlot?.time}</span>
              </div>
            </div>

            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mt-2">Select Payment Endpoint</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "gcash", name: "GCash Smart Wallet", description: "Direct checkout verification portal" },
                { id: "maya", name: "Maya Wallet", description: "Secure instantaneous mobile remittance" },
                { id: "card", name: "Credit / Debit Card", description: "Visa, Mastercard via payment engine link" }
              ].map((method) => (
                <button
                  key={method.id}
                  disabled={isProcessing}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
                    paymentMethod === method.id ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" : "border-muted-foreground/20 hover:border-muted-foreground/40 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="opacity-70 flex-shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-foreground">{method.name}</h5>
                      <p className="text-[10px] text-muted-foreground font-normal mt-0.5">{method.description}</p>
                    </div>
                  </div>
                  <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center", paymentMethod === method.id ? "border-primary" : "border-muted-foreground/40")}>
                    {paymentMethod === method.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/60">
              <Button variant="outline" size="sm" disabled={isProcessing} onClick={() => setStep("SCHEDULE")} className="flex-1 rounded-xl text-xs font-bold uppercase tracking-wider">Back</Button>
              <Button 
                size="sm" 
                disabled={!paymentMethod || isProcessing} 
                onClick={handlePaymentExecution}
                className="flex-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-primary"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Authorizing...</span>
                ) : (
                  `Pay ₱${Number(doctor.consultationFee || 0).toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="text-center py-6 space-y-4 animate-in scale-in duration-300">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Consultation Slot Secured</h3>
              <p className="text-xs text-muted-foreground px-4">
                Your receipt credentials have processed successfully. The appointment data has been bound to your dashboard history logs.
              </p>
            </div>
            
            <div className="rounded-xl border bg-muted/10 p-3.5 text-left text-xs max-w-xs mx-auto space-y-1.5 text-muted-foreground border-dashed">
              <div className="flex justify-between"><span className="font-bold text-foreground">Receipt Reference:</span><span className="font-mono text-[11px] uppercase text-primary">TXN-{Math.floor(100000 + Math.random() * 900000)}</span></div>
              <div className="flex justify-between"><span>Modality Channel:</span><span className="capitalize text-foreground font-medium">{selectedService} Call</span></div>
              <div className="flex justify-between"><span>Time Lock:</span><span className="text-foreground font-medium">{selectedSlot?.date} ({selectedSlot?.time})</span></div>
            </div>

            <div className="pt-2">
              <Button onClick={() => { setOpen(false); resetFlow(); }} className="w-full max-w-xs rounded-xl text-xs font-bold uppercase tracking-wider bg-primary h-10">
                Return to Directory
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}