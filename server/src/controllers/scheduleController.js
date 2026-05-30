import { db } from '../config/db.js';
import { doctorSchedules } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// GET: Fetch all active schedules for the calendar matrix view
export const getSchedules = async (req, res, next) => {
  try {
    // Use only authenticated user ID to prevent unauthorized access to other doctors' schedules
    const doctorId = req.userId;
    if (!doctorId) {
      return res.status(401).json({ error: "Unauthorized: authentication required" });
    }

    // Pull rows matching the target authenticated user mapping
    const rawSchedules = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, doctorId));

    // Map rows cleanly to client structural definitions
    const schedules = rawSchedules.map((slot) => {
      const startObj = new Date(slot.startTime);
      return {
        id: slot.id,
        date: startObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        startTime: startObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date(slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        rawStartTime: slot.startTime, // Keeps native ISO timestamp strings intact
        rawEndTime: slot.endTime,     // Keeps native ISO timestamp strings intact
        isBooked: slot.isBooked
      };
    });

    return res.status(200).json({ schedules });
  } catch (error) {
    next(error);
  }
};

// POST: Instant creation and confirmation of an available time block
export const createSchedule = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const doctorId = req.userId;

    if (!startTime || !endTime || !doctorId) {
      return res.status(400).json({ error: "Required appointment boundaries or doctor mapping tokens are missing" });
    }

    // Direct insertion using Drizzle ORM model specs
    const [newSlot] = await db
      .insert(doctorSchedules)
      .values({
        doctorId,
        startTime: new Date(startTime), // Map string components directly into database timestamps
        endTime: new Date(endTime),     // Map string components directly into database timestamps
        isBooked: false,
      })
      .returning();

    return res.status(201).json({ slot: newSlot });
  } catch (error) {
    next(error);
  }
};

// DELETE: Remove an unbooked available slot by ID safely
export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctorId = req.userId;

    if (!id) {
      return res.status(400).json({ error: "Missing target schedule slot identifier link" });
    }

    if (!doctorId) {
      return res.status(401).json({ error: "Unauthorized: authentication required" });
    }

    // Fetch slot layout to confirm it is owned by authenticated doctor and not already reserved by a patient
    const [existingSlot] = await db
      .select()
      .from(doctorSchedules)
      .where(and(
        eq(doctorSchedules.id, id),
        eq(doctorSchedules.doctorId, doctorId)
      ))
      .limit(1);

    if (!existingSlot) {
      return res.status(404).json({ error: "Target schedule slot record could not be found or you do not have permission to delete it" });
    }

    if (existingSlot.isBooked) {
      return res.status(400).json({ error: "Protected execution path: Cannot delete an active booking record slot row" });
    }

    // Perform table mutation drop
    await db
      .delete(doctorSchedules)
      .where(and(
        eq(doctorSchedules.id, id),
        eq(doctorSchedules.doctorId, doctorId)
      ));

    return res.status(200).json({ success: true, message: "Slot cleaned from table index matrix safely." });
  } catch (error) {
    next(error);
  }
};