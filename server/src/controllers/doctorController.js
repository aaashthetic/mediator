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

// Static service offerings for demonstration purposes (can be expanded to dynamic in future iterations)
const DEFAULT_SERVICES = [
  { id: "chat", name: "Text Consultation", description: "Real-time messaging channels" },
  { id: "video", name: "Video Conference", description: "High definition telehealth call" }
];

// Fetch all doctors
export const getAllDoctors = async (req, res, next) => {
  try {
    const allDoctors = await db.select().from(doctors);
    
    const doctorsList = allDoctors.map((doctor) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      profilePicture: doctor.profilePicture || "/placeholder-avatar.png",
      bio: doctor.bio ||  "No clinical biography provided.",
      consultationFee: Number(doctor.consultationFee || 0),
      yearsOfExperience: computeExperience(doctor.medicalPracticeStartDate),
    }));

    return res.status(200).json({ doctors: doctorsList });
  } catch (error) {
    next(error);
  }
};

// Fetch single doctor by ID
export const getDoctorById = async (req, res, next) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({ error: "Missing doctor ID" });
    }

    const rows = await db
      .select({
        doctor: doctors,
        schedule: doctorSchedules,
      })
      .from(doctors)
      .leftJoin(
        doctorSchedules,
        and(
          eq(doctorSchedules.doctorId, doctors.id),
          eq(doctorSchedules.isBooked, false)
        )
      )
      .where(eq(doctors.id, docId))
      .orderBy(asc(doctorSchedules.startTime));
    
    if (!rows.length) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const doc = rows[0].doctor;

    const availableSlots = rows
      .filter(row => row.schedule !== null)
      .map(({ schedule }) => {
        const start = new Date(schedule.startTime);
        return {
          id: schedule.id,
          date: start.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
          time: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
        };
      });

    // Assemble custom UI component signature state payload
    const doctorDetails = {
      ...doc,
      firstName: doc.firstName,
      lastName: doc.lastName,
      profilePicture: doc.profilePicture || "/placeholder-avatar.png",
      bio: doc.bio ||  "No clinical biography provided.",
      consultationFee: Number(doc.consultationFee || 0),
      yearsOfExperience: computeExperience(doc.medicalPracticeStartDate),
      services: DEFAULT_SERVICES,
      availableSlots,
    };

    return res.status(200).json({ doctor: doctorDetails });
  } catch (error) {
    next(error);
  }
};

export async function createDoctor(req, res, next) {
  try {
    const { userId } = getAuth(req);
     
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access token" });
    }

    // Access validated data straight from middleware attachment
    const { firstName, lastName, specialization, bio, consultationFee, medicalPracticeStartDate } = req.validatedBody;

    const clerkUser = await clerkClient.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || null;

    // Save directly into db
    await db.insert(doctors).values({
      id: userId,
      profilePicture,
      firstName,
      lastName,
      specialization,
      bio,
      isVerified: false,
      consultationFee: Number(consultationFee).toFixed(2),
      medicalPracticeStartDate: new Date(medicalPracticeStartDate),
    });

    // Update remote profiles in Clerk
    await Promise.all([
      clerkClient.users.updateUser(userId, { firstName, lastName }),
      clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "doctor",
          onboardingComplete: true,
          doctorVerified: false,
          specialization,
        }
      })
    ]);

    return res.status(200).json({ success: true, message: "Doctor onboarded successfully" });
  } catch (error) {
    next(error); 
  }
}