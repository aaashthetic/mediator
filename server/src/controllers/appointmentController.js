import { db } from '../config/db.js';
import { appointments, doctorSchedules, patients, doctors, medicalRecords } from '../db/schema.js';
import { eq, and, desc, count } from 'drizzle-orm';

// Helper function to format readable slot arrays from schedule join fields
const formatAppointmentSlot = (startTimeString, endTimeString) => {
  if (!startTimeString) return { date: "N/A", startTime: "N/A", endTime: "N/A" };
  const start = new Date(startTimeString);
  const formattedStart = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  
  let formattedEnd = "";
  if (endTimeString) {
    const end = new Date(endTimeString);
    formattedEnd = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  
  return {
    date: start.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
    startTime: formattedStart,
    endTime: formattedEnd,
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

    console.log("QUERY USER:", userId);

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
      const slotInfo = formatAppointmentSlot(row.schedule?.startTime, row.schedule?.endTime);
      return {
        id: row.appointment.id,
        status: row.appointment.status,
        modality: row.appointment.modality,
        paymentMethod: row.appointment.paymentMethod,
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
          consultationFee: Number(row.doctor.consultationFee || 0),
        } : null,
        schedule: row.schedule ? {
          id: row.schedule.id,
          date: slotInfo.date,
          startTime: slotInfo.startTime,
          endTime: slotInfo.endTime,
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
      modality: targetRow.appointment.modality,
      paymentMethod: targetRow.appointment.paymentMethod,
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
    const data = req.validatedBody || req.body;
    const { doctorId, scheduleId, modality, paymentMethod } = data;

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
          modality,
          paymentMethod,
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

// Update appointment
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newScheduleId } = req.body;

    if (!id || !newScheduleId) {
      return res.status(400).json({ error: "Missing appointment ID or new schedule slot identifier" });
    }

    const updatedAppointment = await db.transaction(async (tx) => {
      // Fetch current appointment details to find the old schedule slot
      const [currentAppointment] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!currentAppointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
      }

      if (currentAppointment.status === "cancelled") {
        throw new Error("CANNOT_RESCHEDULE_CANCELLED");
      }

      // If they are trying to move to the same slot, exit early
      if (currentAppointment.scheduleId === newScheduleId) {
        return currentAppointment;
      }

      // Validate availability of the new slot
      const [newSlot] = await tx
        .select()
        .from(doctorSchedules)
        .where(
          and(
            eq(doctorSchedules.id, newScheduleId),
            eq(doctorSchedules.doctorId, currentAppointment.doctorId)
          )
        );

      if (!newSlot) {
        throw new Error("NEW_SCHEDULE_NOT_FOUND");
      }

      if (newSlot.isBooked) {
        throw new Error("NEW_SLOT_ALREADY_RESERVED");
      }

      // Free up the old slot
      await tx
        .update(doctorSchedules)
        .set({ isBooked: false })
        .where(eq(doctorSchedules.id, currentAppointment.scheduleId));

      // Reserve the new slot
      await tx
        .update(doctorSchedules)
        .set({ isBooked: true })
        .where(eq(doctorSchedules.id, newScheduleId));

      // Update the appointment record
      const [updated] = await tx
        .update(appointments)
        .set({
          scheduleId: newScheduleId,
          status: 'confirmed', // Reset status if it was pending
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    if (error.message === "APPOINTMENT_NOT_FOUND") {
      return res.status(404).json({ error: "The requested appointment record does not exist" });
    }
    if (error.message === "CANNOT_RESCHEDULE_CANCELLED") {
      return res.status(400).json({ error: "Cancelled appointments cannot be rescheduled. Please book a new one." });
    }
    if (error.message === "NEW_SCHEDULE_NOT_FOUND") {
      return res.status(404).json({ error: "The targeted schedule slot does not exist for this practitioner" });
    }
    if (error.message === "NEW_SLOT_ALREADY_RESERVED") {
      return res.status(409).json({ error: "The targeted consultation window is already reserved" });
    }
    next(error);
  }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing appointment identifier" });
    }

    const cancelledAppointment = await db.transaction(async (tx) => {
      // Fetch current appointment details to lock down the bound schedule target
      const [currentAppointment] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!currentAppointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
      }

      if (currentAppointment.status === "cancelled") {
        return currentAppointment;
      }

      // Unlocks the practitioner's time window slot
      await tx
        .update(doctorSchedules)
        .set({ isBooked: false })
        .where(eq(doctorSchedules.id, currentAppointment.scheduleId));

      // Mark the appointment status context as cancelled
      const [updated] = await tx
        .update(appointments)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully, schedule window has been released",
      appointment: cancelledAppointment,
    });
  } catch (error) {
    if (error.message === "APPOINTMENT_NOT_FOUND") {
      return res.status(404).json({ error: "The requested appointment record does not exist" });
    }
    next(error);
  }
};

// Permanently delete an appointment row
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing appointment identifier" });
    }

    await db.transaction(async (tx) => {
      // Fetch target appointment to check state before purging
      const [currentAppointment] = await tx
        .select()
        .from(appointments)
        .where(eq(appointments.id, id));

      if (!currentAppointment) {
        throw new Error("APPOINTMENT_NOT_FOUND");
      }

      // If the appointment wasn't already cancelled, liberate the schedule slot first
      if (currentAppointment.status !== "cancelled") {
        await tx
          .update(doctorSchedules)
          .set({ isBooked: false })
          .where(eq(doctorSchedules.id, currentAppointment.scheduleId));
      }

      // Clean up associated medical records if your schema doesn't use ON DELETE CASCADE
      await tx
        .delete(medicalRecords)
        .where(eq(medicalRecords.appointmentId, id));

      // Remove the appointment record permanently
      await tx
        .delete(appointments)
        .where(eq(appointments.id, id));
    });

    return res.status(200).json({
      success: true,
      message: "Appointment record permanently purged from database references",
    });
  } catch (error) {
    if (error.message === "APPOINTMENT_NOT_FOUND") {
      return res.status(404).json({ error: "The requested appointment record does not exist" });
    }
    next(error);
  }
};