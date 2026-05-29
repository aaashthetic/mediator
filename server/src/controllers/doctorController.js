import { db } from '../config/db.js';
import { doctors, doctorSchedules } from '../db/schema.js';
import { eq, and, asc } from 'drizzle-orm';

// Helper function to calculate experience dynamically
const computeExperience = (startDateString) => {
  if (!startDateString) return 0;
  const startDate = new Date(startDateString);
  const currentDate = new Date();
  
  let years = currentDate.getFullYear() - startDate.getFullYear();
  const anniversaryPassed = 
    currentDate.getMonth() > startDate.getMonth() || 
    (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() >= startDate.getDate());
    
  if (!anniversaryPassed) years--;
  return Math.max(0, years);
};

// Fetch All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const allDoctors = await db.select().from(doctors);
    
    // Map minimal details for a list view card
    const formattedDoctors = allDoctors.map((doc) => ({
      id: doc.id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      specialization: doc.specialization,
      profilePicture: doc.profilePicture || "/placeholder-avatar.png",
      bio: doc.bio ||  "No clinical biography provided.",
      price: Number(doc.consultationFee || 0),
      yearsOfExperience: computeExperience(doc.medicalPracticeStartDate),
    }));

    return res.status(200).json({ doctors: formattedDoctors });
  } catch (error) {
    console.error("Fetch All Doctors Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch Single Doctor By ID with Available Schedules
export const getDoctorById = async (req, res) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({ error: "Missing practitioner identifier" });
    }

    // Fetch Doctor Profile
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, docId)).limit(1);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    // Fetch Unbooked Schedules sorted chronologically
    const schedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.doctorId, docId),
          eq(doctorSchedules.isBooked, false)
        )
      )
      .orderBy(asc(doctorSchedules.startTime));

    // Assemble Custom UI Component Signature State Payload
    const doctorDetails = {
      ...doctor,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      profilePicture: doctor.profilePicture || "/placeholder-avatar.png",
      bio: doctor.bio ||  "No clinical biography provided.",
      consultationFee: Number(doctor.consultationFee || 0),
      yearsOfExperience: computeExperience(doctor.medicalPracticeStartDate),
      
      services: [
        { id: "chat", name: "Text Consultation", description: "Real-time messaging channels" },
        { id: "video", name: "Video Conference", description: "High definition telehealth call" }
      ],
      
      availableSlots: schedules.map((slot) => ({
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

    return res.status(200).json({ doctor: doctorDetails });

  } catch (error) {
    console.error("Fetch Doctor By ID Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};