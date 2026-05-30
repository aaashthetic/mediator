import { db } from '../config/db.js';
import { doctorSchedules, doctors } from '../db/schema.js';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

// Helper function to format schedule slots for UI
const formatScheduleSlot = (startTimeString, endTimeString) => {
  if (!startTimeString) return { date: "N/A", startTime: "N/A", endTime: "N/A" };
  const start = new Date(startTimeString);
  const end = new Date(endTimeString);
  const formattedStart = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const formattedEnd = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  
  return {
    date: start.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
    startTime: formattedStart,
    endTime: formattedEnd,
  };
};

// Fetch all schedules for a doctor (with optional filters for date range)
export const getDoctorSchedules = async (req, res, next) => {
  try {
    const { doctorId, startDate, endDate, includeBooked } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: "Missing doctor identifier" });
    }

    // Build query conditions
    const conditions = [eq(doctorSchedules.doctorId, doctorId)];

    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate);
      conditions.push(gte(doctorSchedules.startTime, start));
    }

    if (endDate) {
      const end = new Date(endDate);
      conditions.push(lte(doctorSchedules.startTime, end));
    }

    // Optionally filter out booked slots
    if (includeBooked === "false") {
      conditions.push(eq(doctorSchedules.isBooked, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch schedules sorted by start time
    const schedules = await db
      .select()
      .from(doctorSchedules)
      .where(whereClause)
      .orderBy(desc(doctorSchedules.startTime));

    // Format schedules for UI
    const formattedSchedules = schedules.map((schedule) => {
      const slotInfo = formatScheduleSlot(schedule.startTime, schedule.endTime);
      return {
        id: schedule.id,
        doctorId: schedule.doctorId,
        date: slotInfo.date,
        startTime: slotInfo.startTime,
        endTime: slotInfo.endTime,
        isBooked: schedule.isBooked,
        rawStartTime: schedule.startTime,
        rawEndTime: schedule.endTime,
      };
    });

    return res.status(200).json({
      success: true,
      schedules: formattedSchedules,
    });
  } catch (error) {
    next(error);
  }
};

// Fetch a single schedule by ID
export const getScheduleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing schedule identifier" });
    }

    const [schedule] = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.id, id));

    if (!schedule) {
      return res.status(404).json({ error: "Schedule slot not found" });
    }

    const slotInfo = formatScheduleSlot(schedule.startTime, schedule.endTime);

    return res.status(200).json({
      success: true,
      schedule: {
        id: schedule.id,
        doctorId: schedule.doctorId,
        date: slotInfo.date,
        startTime: slotInfo.startTime,
        endTime: slotInfo.endTime,
        isBooked: schedule.isBooked,
        rawStartTime: schedule.startTime,
        rawEndTime: schedule.endTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create new schedule slots for a doctor
export const createSchedule = async (req, res, next) => {
  try {
    const doctorId = req.userId; // From auth middleware
    const { startTime, endTime } = req.body;

    if (!doctorId) {
      return res.status(401).json({ error: "Unauthorized doctor access credentials" });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ error: "Missing startTime or endTime" });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }

    if (start < new Date()) {
      return res.status(400).json({ error: "Cannot create schedules in the past" });
    }

    // Check if doctor exists and is verified
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, doctorId));

    if (!doctor) {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    if (!doctor.isVerified) {
      return res.status(403).json({ error: "Only verified doctors can create schedules" });
    }

    // Create schedule slot
    const [newSchedule] = await db
      .insert(doctorSchedules)
      .values({
        doctorId,
        startTime: start,
        endTime: end,
        isBooked: false,
      })
      .returning();

    const slotInfo = formatScheduleSlot(newSchedule.startTime, newSchedule.endTime);

    return res.status(201).json({
      success: true,
      message: "Schedule slot created successfully",
      schedule: {
        id: newSchedule.id,
        doctorId: newSchedule.doctorId,
        date: slotInfo.date,
        startTime: slotInfo.startTime,
        endTime: slotInfo.endTime,
        isBooked: newSchedule.isBooked,
        rawStartTime: newSchedule.startTime,
        rawEndTime: newSchedule.endTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a schedule slot (mainly for changing availability)
export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Missing schedule identifier" });
    }

    // Fetch existing schedule
    const [existingSchedule] = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.id, id));

    if (!existingSchedule) {
      return res.status(404).json({ error: "Schedule slot not found" });
    }

    // Cannot update booked schedules
    if (existingSchedule.isBooked) {
      return res.status(409).json({ error: "Cannot modify a booked schedule slot" });
    }

    const updateData = {};

    if (startTime) {
      const start = new Date(startTime);
      if (start < new Date()) {
        return res.status(400).json({ error: "Cannot set schedule in the past" });
      }
      updateData.startTime = start;
    }

    if (endTime) {
      const end = new Date(endTime);
      updateData.endTime = end;
    }

    // Validate that start is before end
    const finalStart = updateData.startTime || existingSchedule.startTime;
    const finalEnd = updateData.endTime || existingSchedule.endTime;

    if (finalStart >= finalEnd) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }

    // Update schedule
    const [updatedSchedule] = await db
      .update(doctorSchedules)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(doctorSchedules.id, id))
      .returning();

    const slotInfo = formatScheduleSlot(updatedSchedule.startTime, updatedSchedule.endTime);

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      schedule: {
        id: updatedSchedule.id,
        doctorId: updatedSchedule.doctorId,
        date: slotInfo.date,
        startTime: slotInfo.startTime,
        endTime: slotInfo.endTime,
        isBooked: updatedSchedule.isBooked,
        rawStartTime: updatedSchedule.startTime,
        rawEndTime: updatedSchedule.endTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a schedule slot
export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing schedule identifier" });
    }

    // Fetch schedule to check if it's booked
    const [existingSchedule] = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.id, id));

    if (!existingSchedule) {
      return res.status(404).json({ error: "Schedule slot not found" });
    }

    if (existingSchedule.isBooked) {
      return res.status(409).json({ error: "Cannot delete a booked schedule slot" });
    }

    // Delete the schedule
    await db.delete(doctorSchedules).where(eq(doctorSchedules.id, id));

    return res.status(200).json({
      success: true,
      message: "Schedule slot deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Bulk delete schedules (for doctor to clear old availability)
export const bulkDeleteSchedules = async (req, res, next) => {
  try {
    const doctorId = req.userId;
    const { scheduleIds } = req.body;

    if (!doctorId) {
      return res.status(401).json({ error: "Unauthorized doctor access credentials" });
    }

    if (!scheduleIds || !Array.isArray(scheduleIds) || scheduleIds.length === 0) {
      return res.status(400).json({ error: "Missing or invalid scheduleIds array" });
    }

    // Verify all schedules belong to the doctor and are not booked
    const schedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.doctorId, doctorId),
          eq(doctorSchedules.isBooked, false)
        )
      );

    const validIds = schedules
      .filter((s) => scheduleIds.includes(s.id))
      .map((s) => s.id);

    if (validIds.length === 0) {
      return res.status(400).json({ error: "No valid unbooked schedules found to delete" });
    }

    // Delete schedules
    await db
    .delete(doctorSchedules)
    .where(
      and(
        eq(doctorSchedules.doctorId, doctorId),
        eq(doctorSchedules.isBooked, false),
        inArray(doctorSchedules.id, validIds)
      )
    );

    for (const scheduleId of validIds.slice(1)) {
      await db.delete(doctorSchedules).where(eq(doctorSchedules.id, scheduleId));
    }

    return res.status(200).json({
      success: true,
      message: `${validIds.length} schedule slot(s) deleted successfully`,
      deletedCount: validIds.length,
    });
  } catch (error) {
    next(error);
  }
};
