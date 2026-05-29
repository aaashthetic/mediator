import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { doctors, doctorSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET( req: Request, { params }: { params: Promise<{ docId: string }> }) {
  try {
    // Verify Authentication
    const { userId: patientClerkId } = await auth();
    if (!patientClerkId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { docId } = await params;
    if (!docId) {
      return NextResponse.json({ error: "Missing practitioner identifier" }, { status: 400 });
    }

    // Query Doctor Profile & Unbooked Schedules from DB
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, docId),
      with: {
        schedules: {
          where: eq(doctorSchedules.isBooked, false),
          orderBy: (schedules, { asc }) => [asc(schedules.startTime)],
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Compute Real-Time Experience Metrics
    let dynamicYearsOfExperience = 0;
    if (doctor.medicalPracticeStartDate) {
      const startDate = new Date(doctor.medicalPracticeStartDate);
      const currentDate = new Date();
      
      dynamicYearsOfExperience = currentDate.getFullYear() - startDate.getFullYear();
      const anniversaryPassed = 
        currentDate.getMonth() > startDate.getMonth() || 
        (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() >= startDate.getDate());
        
      if (!anniversaryPassed) {
        dynamicYearsOfExperience--;
      }
    }

    // Transform Data into Component UI State Signatures
    const doctorDetails = {
      ...doctor,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      avatarUrl: doctor.profilePicture || "/placeholder-avatar.png",
      bio: doctor.bio,
      price: Number(doctor.consultationFee || 0),
      yearsOfExperience: Math.max(0, dynamicYearsOfExperience),
      
      services: [
        { id: "chat", name: "Text Consultation", description: "Real-time messaging channels" },
        { id: "video", name: "Video Conference", description: "High definition telehealth call" }
      ],
      
      availableSlots: (doctor.schedules || []).map((slot) => ({
        id: slot.id,
        date: new Date(slot.startTime).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        time: new Date(slot.startTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      }))
    };

    return NextResponse.json({ doctor: doctorDetails }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}