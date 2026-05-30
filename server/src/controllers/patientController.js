import { db } from '../config/db.js';
import { patients, appointments, doctors, doctorSchedules } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { getAuth, clerkClient } from '@clerk/express';

// Helper function to calculate age dynamically based on birthday
const computeAge = (birthdayString) => {
  if (!birthdayString) return 0;
  const birthDate = new Date(birthdayString);
  const currentDate = new Date();
  
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const anniversaryPassed = 
    currentDate.getMonth() > birthDate.getMonth() || 
    (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() >= birthDate.getDate());
    
  if (!anniversaryPassed) age--;
  return Math.max(0, age);
};


// Fetch all patients
export const getAllPatients = async (req, res, next) => {
  try {
    const allPatients = await db.select().from(patients);
    
    const formattedPatients = allPatients.map((patient) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      profilePicture: patient.profilePicture || "/placeholder-avatar.png",
      phone: patient.phone,
      age: computeAge(patient.birthday),
      physicalMetrics: {
        weightKg: Number(patient.weight),
        heightCm: Number(patient.height),
      },
      medicalSummary: patient.basicMedicalHistory || "No historical logs updated."
    }));

    return res.status(200).json({ patients: formattedPatients });
  } catch (error) {
    next(error);
  }
};


// Fetch patient by ID with appointment history
export const getPatientById = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ error: "Missing patient identifier" });
    }

    // Profile details and appointments
    const rows = await db
      .select({
        patient: patients,
        appointment: appointments,
        doctor: doctors,
        schedule: doctorSchedules
      })
      .from(patients)
      .leftJoin(appointments, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(doctors.id, appointments.doctorId))
      .leftJoin(doctorSchedules, eq(doctorSchedules.id, appointments.scheduleId))
      .where(eq(patients.id, patientId))
      .orderBy(desc(appointments.createdAt));

    if (!rows.length) {
      return res.status(404).json({ error: "Patient profile registry not found" });
    }

    const patientRecord = rows[0].patient;

    // Filter out null rows produced by the left join if the patient has zero appointments booked yet
    const processedAppointments = rows
      .filter(row => row.appointment !== null)
      .map(({ appointment, doctor, schedule }) => {
        const start = new Date(schedule.startTime);
        return {
          id: appointment.id,
          status: appointment.status,
          roomUrl: appointment.roomUrl,
          bookedAt: appointment.createdAt,
          practitioner: {
            id: doctor.id,
            fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            specialization: doctor.specialization,
            profilePicture: doctor.profilePicture || "/placeholder-avatar.png"
          },
          schedule: {
            date: start.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
            time: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
          }
        };
      });

    // Structure optimized UI component signature payload
    const patientDetails = {
      id: patientRecord.id,
      firstName: patientRecord.firstName,
      lastName: patientRecord.lastName,
      profilePicture: patientRecord.profilePicture || "/placeholder-avatar.png",
      phone: patientRecord.phone,
      birthday: patientRecord.birthday,
      age: computeAge(patientRecord.birthday),
      metrics: {
        weight: Number(patientRecord.weight || 0),
        height: Number(patientRecord.height || 0),
      },
      basicMedicalHistory: patientRecord.basicMedicalHistory || "No historical records shared.",
      createdAt: patientRecord.createdAt,
      appointmentHistory: processedAppointments
    };

    return res.status(200).json({ patient: patientDetails });
  } catch (error) {
    next(error);
  }
};

// Create patient profile
export async function createPatient(req, res, next) {
  try {
    const { userId } = getAuth(req);
     
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access token" });
    }

    // Pull verified dataset structured from custom validation router middleware
    const { firstName, lastName, birthday, weight, height, phone, basicMedicalHistory } = req.validatedBody;

    // Extract synced image assets out of Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || null;

    // Direct insertion transaction executing down to remote database instance
    await db.insert(patients).values({
      id: userId,
      profilePicture,
      firstName,
      lastName,
      birthday: new Date(birthday).toISOString().split('T')[0],
      weight: Number(weight).toFixed(2),
      height: Number(height).toFixed(2),
      phone,
      basicMedicalHistory: basicMedicalHistory || null,
    });

    // Concurrently handle all mutations hitting remote Clerk infrastructure via unified thread groups
    await Promise.all([
      clerkClient.users.updateUser(userId, { firstName, lastName }),
      clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "patient",
          onboardingComplete: true
        }
      })
    ]);

    return res.status(200).json({ success: true, message: "Patient profile onboarded successfully" });
  } catch (error) {
    next(error); 
  }
}