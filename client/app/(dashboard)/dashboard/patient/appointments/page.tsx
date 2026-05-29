"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, FileText, Loader2, CheckCircle } from "lucide-react";

interface Appointment {
  id: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  reason: string;
  status: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsgs, setErrorMsgs] = useState<Record<string, string[]>>({});
  
  // Form State
  const [formData, setFormData] = useState({
    doctorName: "",
    department: "",
    appointmentDate: "",
    reason: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (res.ok) setAppointments(data.appointments);
    } catch (err) {
      console.error("Failed fetching appointments", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsgs({});

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          appointmentDate: formData.appointmentDate ? new Date(formData.appointmentDate).toISOString() : "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) setErrorMsgs(data.details);
        else alert(data.error || "Something went wrong");
      } else {
        setFormData({ doctorName: "", department: "", appointmentDate: "", reason: "" });
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments Hub</h1>
        <p className="text-muted-foreground">Schedule clinical visits or view status confirmations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-1 bg-card border rounded-xl p-5 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">Request Consultation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Doctor Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 mt-1 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.doctorName}
                onChange={e => setFormData({...formData, doctorName: e.target.value})}
                placeholder="e.g. Dr. Jane Smith"
              />
              {errorMsgs.doctorName && <p className="text-xs text-destructive mt-1">{errorMsgs.doctorName[0]}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Medical Department</label>
              <select 
                className="w-full px-3 py-2 mt-1 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Dermatology">Dermatology</option>
              </select>
              {errorMsgs.department && <p className="text-xs text-destructive mt-1">{errorMsgs.department[0]}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full px-3 py-2 mt-1 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.appointmentDate}
                onChange={e => setFormData({...formData, appointmentDate: e.target.value})}
              />
              {errorMsgs.appointmentDate && <p className="text-xs text-destructive mt-1">{errorMsgs.appointmentDate[0]}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Reason for Visit</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 mt-1 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                placeholder="Describe your primary symptoms..."
              />
              {errorMsgs.reason && <p className="text-xs text-destructive mt-1">{errorMsgs.reason[0]}</p>}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-sm"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "Book Appointment"}
            </button>
          </form>
        </div>

        {/* Existing Records Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your Scheduled Trackers</h2>
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
          ) : appointments.length === 0 ? (
            <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground text-sm">
              No upcoming appointments logged. Submit the form on the left to schedule.
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="bg-card border rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-foreground">{apt.doctorName}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground border">
                      {apt.department}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={13}/> {new Date(apt.appointmentDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={13}/> {new Date(apt.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2 mt-1"><FileText size={14} className="inline mr-1 text-muted-foreground" /> {apt.reason}</p>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm self-start md:self-auto ${
                  apt.status === "scheduled" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                }`}>
                  {apt.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}