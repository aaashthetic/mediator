import { db } from '../config/db.js';
import { appointments, doctorSchedules, patients, doctors, medicalRecords } from '../db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';

// Helper function to format readable slot arrays from schedule join fields
const formatAppointmentSlot = (startTimeString) => {
  if (!startTimeString) return { date: "N/A", time: "N/A" };
  const start = new Date(startTimeString);
  return {
    date: start.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
    time: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
};

// Fetch list of appointments scoped by user roles and dynamic query inputs
export const getAppointments = async (req, res, next) => {
  try {
    const { role, userId, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (!role || !userId) {
      return res.status(400).json({ error: "Missing identity scoping parameters ()role & userId" });
    }

    // Construct conditional filters array matching relational parameters
    const conditions = [];
    if (role === 'patient') {
      conditions.push(eq(appointments.patientId, userId));
    } else if (role === 'doctor') {
      conditions.push(eq(appointments.doctorId, userId));
    }

    if (status) {
      conditions.push(eq(appointments.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Concurrently execute relational mappings alongside precise count metrics
    const [rawRows, [countRecord]] = await Promise.all([
      db.select({
        appointment: appointments,
        patient: patients,
        doctor: doctors,
        schedule: doctorSchedules,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(doctorSchedules, eq(appointments.scheduleId, doctorSchedules.id))
      .where(whereClause)
      .limit(Number(limit))
      .offset(offset)
      .orderBy(desc(appointments.createdAt)),

      db.select({ total: count() }).from(appointments).where(whereClause)
    ]);

    const totalItems = countRecord?.total || 0;

    // Map rows into tailored sub-object contracts for cleaner UI interpretation
    const appointmentList = rawRows.map((row) => {
      const slotInfo = formatAppointmentSlot(row.schedule?.startTime);
      return {
        id: row.appointment.id,
        status: row.appointment.status,
        roomUrl: row.appointment.roomUrl,
        createdAt: row.appointment.createdAt,
        patient: row.patient ? {
          id: row.patient.id,
          firstName: row.patient.firstName,
          lastName: row.patient.lastName,
          profilePicture: row.patient.profilePicture || "/placeholder-avatar.png",
        } : null,
        doctor: row.doctor ? {
          id: row.doctor.id,
          firstName: row.doctor.firstName,
          lastName: row.doctor.lastName,
          specialization: row.doctor.specialization,
          profilePicture: row.doctor.profilePicture || "/placeholder-avatar.png",
        } : null,
        schedule: row.schedule ? {
          id: row.schedule.id,
          date: slotInfo.date,
          time: slotInfo.time,
        } : null,
      };
    });

    return res.status(200).json({
      meta: {
        totalItems,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / Number(limit)),
      },
      appointments: appointmentList,
    });
  } catch (error) {
    next(error);
  }
};

// Fetch single appointment by ID with comprehensive participant metadata
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing appointment identifier" });
    }

    // Pull combined relation tables based on primary key matching
    const rows = await db
      .select({
        appointment: appointments,
        patient: patients,
        doctor: doctors,
        schedule: doctorSchedules,
        medicalRecord: medicalRecords,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .leftJoin(doctorSchedules, eq(appointments.scheduleId, doctorSchedules.id))
      .leftJoin(medicalRecords, eq(appointments.id, medicalRecords.appointmentId))
      .where(eq(appointments.id, id));

    if (!rows.length) {
      return res.status(404).json({ error: "Appointment record not found" });
    }

    const targetRow = rows[0];
    const slotInfo = formatAppointmentSlot(targetRow.schedule?.startTime);

    // Assemble unified UI layout payload contract
    const appointmentDetails = {
      id: targetRow.appointment.id,
      status: targetRow.appointment.status,
      roomUrl: targetRow.appointment.roomUrl,
      createdAt: targetRow.appointment.createdAt,
      updatedAt: targetRow.appointment.updatedAt,
      patient: targetRow.patient ? {
        id: targetRow.patient.id,
        firstName: targetRow.patient.firstName,
        lastName: targetRow.patient.lastName,
        profilePicture: targetRow.patient.profilePicture || "/placeholder-avatar.png",
        phone: targetRow.patient.phone,
        birthday: targetRow.patient.birthday,
        weight: Number(targetRow.patient.weight || 0),
        height: Number(targetRow.patient.height || 0),
        basicMedicalHistory: targetRow.patient.basicMedicalHistory || "None declared.",
      } : null,
      doctor: targetRow.doctor ? {
        id: targetRow.doctor.id,
        firstName: targetRow.doctor.firstName,
        lastName: targetRow.doctor.lastName,
        specialization: targetRow.doctor.specialization,
        profilePicture: targetRow.doctor.profilePicture || "/placeholder-avatar.png",
        consultationFee: Number(targetRow.doctor.consultationFee || 0),
      } : null,
      schedule: targetRow.schedule ? {
        id: targetRow.schedule.id,
        date: slotInfo.date,
        time: slotInfo.time,
      } : null,
      medicalRecord: targetRow.medicalRecord ? {
        id: targetRow.medicalRecord.id,
        consultationNotes: targetRow.medicalRecord.consultationNotes,
        prescriptions: targetRow.medicalRecord.prescriptions || "",
        createdAt: targetRow.medicalRecord.createdAt,
      } : null,
    };

    return res.status(200).json({ appointment: appointmentDetails });
  } catch (error) {
    next(error);
  }
};

// Create an isolated consultation reservation record using an ACID transaction block
export const createAppointment = async (req, res, next) => {
  try {
    // Rely on authenticated patient session attributes passed from context auth wrappers
    const patientId = req.userId;
    
    // Access validated schema parameters safely straight from middleware extensions
    const { doctorId, scheduleId } = req.validatedBody;

    if (!patientId) {
      return res.status(401).json({ error: "Unauthorized patient access credentials" });
    }

    // Execute atomic validation check and update block
    const appointmentResult = await db.transaction(async (tx) => {
      
      // Check schedule slot availability configurations
      const [slot] = await tx
        .select()
        .from(doctorSchedules)
        .where(
          and(
            eq(doctorSchedules.id, scheduleId),
            eq(doctorSchedules.doctorId, doctorId)
          )
        );

      if (!slot) {
        throw new Error("SCHEDULE_NOT_FOUND");
      }

      if (slot.isBooked) {
        throw new Error("SLOT_ALREADY_RESERVED");
      }

      // Commit booking reservation lock state immediately
      await tx
        .update(doctorSchedules)
        .set({ isBooked: true })
        .where(eq(doctorSchedules.id, scheduleId));

      // Insert and instantiate pristine appointment row
      const [insertedAppointment] = await tx
        .insert(appointments)
        .values({
          patientId,
          doctorId,
          scheduleId,
          status: 'confirmed',
          roomUrl: null,
        })
        .returning();

      return insertedAppointment;
    });

    return res.status(200).json({
      success: true,
      message: "Consultation slot secured successfully",
      appointment: appointmentResult,
    });
  } catch (error) {
    // Intercept operational transaction errors explicitly to deliver clean status responses
    if (error.message === "SCHEDULE_NOT_FOUND") {
      return res.status(404).json({ error: "The requested schedule slot does not exist for this practitioner" });
    }
    if (error.message === "SLOT_ALREADY_RESERVED") {
      return res.status(409).json({ error: "This consultation time window has already been reserved" });
    }
    next(error);
  }
};