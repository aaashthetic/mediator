import { db } from '../config/db.js';
import { appointments, medicalRecords } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// POST/PUT: Save or update consultation notes and prescriptions
export const saveConsultationNotes = async (req, res, next) => {
  try {
    const { id: appointmentId } = req.params;
    const { consultationNotes, prescriptions } = req.body;
    const doctorId = req.userId; // Provided safely by your requireAuth middleware

    if (!appointmentId) {
      return res.status(400).json({ error: "Missing targeted appointment linkage scope." });
    }

    // 1. Verify appointment exists and belongs to the requesting physician
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return res.status(404).json({ error: "Linked appointment instance context not found." });
    }

    if (appointment.doctorId !== doctorId) {
      return res.status(403).json({ error: "Forbidden: You are not the authorized practitioner for this session." });
    }

    // 2. Check if a medical record already exists for this appointment slot row
    const [existingRecord] = await db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.appointmentId, appointmentId))
      .limit(1);

    let savedRecord;

    if (existingRecord) {
      // Update entry path execution
      [savedRecord] = await db
        .update(medicalRecords)
        .set({
          consultationNotes: consultationNotes || "",
          prescriptions: prescriptions || "",
          updatedAt: new Date(),
        })
        .where(eq(medicalRecords.appointmentId, appointmentId))
        .returning();
    } else {
      // New record entry path insertion execution
      [savedRecord] = await db
        .insert(medicalRecords)
        .values({
          appointmentId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          consultationNotes: consultationNotes || "",
          prescriptions: prescriptions || "",
        })
        .returning();
        
      // Optional: Automatically transition appointment status matrix layer into 'completed'
      await db
        .update(appointments)
        .set({ status: 'completed' })
        .where(eq(appointments.id, appointmentId));
    }

    return res.status(200).json({
      success: true,
      message: "Clinical metrics matrix and treatment details recorded into registry index ledger.",
      record: savedRecord,
    });
  } catch (error) {
    next(error);
  }
};