"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Calendar, dateFnsLocalizer, Event, View, Views } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { X, CalendarClock, Trash2, AlertTriangle } from "lucide-react";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DbSchedule {
  id: string;
  rawStartTime: string;
  rawEndTime: string;
  isBooked: boolean;
}

interface CalendarEvent extends Event {
  id: string;
  isBooked: boolean;
}

interface ModalState {
  isOpen: boolean;
  type: "past_error" | "booked_error" | "delete_confirm" | "generic_error";
  title: string;
  message: string;
  onConfirm?: () => void;
}

export default function SchedulerView() {
  const { userId, getToken } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "generic_error",
    title: "",
    message: "",
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const loadSchedules = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const token = await getToken();
      
      // Fetch only authenticated user's schedule using auth token
      const res = await fetch(`${apiBaseUrl}/api/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        
        // FIXED syntax structure map error block
        const parsedEvents = (data.schedules || []).map((slot: DbSchedule) => ({
          id: slot.id,
          title: slot.isBooked ? "Booked" : "Available",
          start: new Date(slot.rawStartTime),
          end: new Date(slot.rawEndTime),
          isBooked: slot.isBooked,
        }));
        
        setEvents(parsedEvents);
      }
    } catch (err) {
      console.error("Failed to parse event lists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadSchedules();
    }
  }, [userId]);

  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false }));

  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    if (!userId) return;

    if (start < new Date()) {
      setModal({
        isOpen: true,
        type: "past_error",
        title: "Invalid Slot Placement",
        message: "You cannot schedule clinical availability slots in the past. Please select a future date and time.",
      });
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${apiBaseUrl}/api/schedule`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          startTime: start.toISOString(), 
          endTime: end.toISOString() 
        }),
      });

      if (response.ok) {
        await loadSchedules();
      } else {
        // Read as text instead of JSON to inspect the actual html dump safely!
        const errorText = await response.text();
        console.error(`Backend Error (${response.status}):`, errorText);
        
        let displayMessage = "Failed to confirm availability slot on backend handlers.";
        try {
          // If it happens to be valid JSON after all, parse it
          const parsed = JSON.parse(errorText);
          displayMessage = parsed.error || displayMessage;
        } catch {
          // If it's HTML, show a clean message pointing to the console log
          displayMessage = `Server replied with status ${response.status}. Check your browser inspect terminal console for the raw server output window.`;
        }

        setModal({
          isOpen: true,
          type: "generic_error",
          title: "Execution Error",
          message: displayMessage,
        });
      }
    } catch (error) {
      console.error("Error creating availability slot:", error);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.isBooked) {
      setModal({
        isOpen: true,
        type: "booked_error",
        title: "Slot Locked",
        message: "This clinical session has already been reserved by a patient and cannot be removed.",
      });
      return;
    }

    setModal({
      isOpen: true,
      type: "delete_confirm",
      title: "Remove Available Slot",
      message: "Are you sure you want to delete this specific time window from your available pool?",
      onConfirm: async () => {
        try {
          const token = await getToken();
          const response = await fetch(`${apiBaseUrl}/api/schedule/${event.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.ok) {
            await loadSchedules();
            closeModal();
          } else {
            const err = await response.json();
            setModal({
              isOpen: true,
              type: "generic_error",
              title: "Deletion Failure",
              message: err.error || "Failed to successfully complete slot wipe action.",
            });
          }
        } catch (error) {
          console.error("Error deleting availability slot:", error);
        }
      },
    });
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const isBooked = event.isBooked;
    return {
      style: {
        backgroundColor: isBooked ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)",
        color: isBooked ? "#ef4444" : "#10b981",
        borderLeft: `4px solid ${isBooked ? "#ef4444" : "#10b981"}`,
        borderColor: "transparent",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        padding: "4px 8px"
      }
    };
  };

  if (!userId || loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Synchronizing scheduler maps...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4 relative">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <CalendarClock className="text-primary animate-in fade-in" size={24} />
          Interactive Scheduler Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Click and drag blocks to instantly add availability. Click an existing available slot to delete it.
        </p>
      </div>

      <div className="h-[700px] border rounded-xl bg-card p-4 shadow-sm">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={currentView}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onView={(newView) => setCurrentView(newView)}
          views={["month", "week", "day"]}
          eventPropGetter={eventStyleGetter}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          style={{ height: "100%" }}
        />
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-border bg-background p-6 rounded-xl shadow-2xl space-y-4 transform scale-100 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {modal.type === "delete_confirm" ? (
                  <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                    <Trash2 size={20} />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                    <AlertTriangle size={20} />
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground tracking-tight">{modal.title}</h3>
              </div>
              <button 
                onClick={closeModal} 
                className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-sm text-muted-foreground leading-relaxed">
              {modal.message}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium border border-border bg-background text-foreground rounded-lg hover:bg-muted transition-all"
              >
                {modal.type === "delete_confirm" ? "Cancel" : "Dismiss"}
              </button>
              
              {modal.type === "delete_confirm" && modal.onConfirm && (
                <button
                  onClick={modal.onConfirm}
                  className="px-4 py-2 text-sm font-bold text-white bg-destructive rounded-lg hover:bg-destructive/90 shadow-sm transition-all"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}