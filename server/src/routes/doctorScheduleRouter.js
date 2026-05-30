import { Router } from 'express';
import {
  getDoctorSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  bulkDeleteSchedules,
} from '../controllers/doctorScheduleController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /api/doctor-schedules - Fetch all schedules for a doctor (with optional filters)
router.get('/', requireAuth, getDoctorSchedules);

// GET /api/doctor-schedules/:id - Fetch a single schedule slot by ID
router.get('/:id', requireAuth, getScheduleById);

// POST /api/doctor-schedules - Create a new schedule slot
router.post('/', requireAuth, createSchedule);

// PUT /api/doctor-schedules/:id - Update a schedule slot
router.put('/:id', requireAuth, updateSchedule);

// DELETE /api/doctor-schedules/:id - Delete a schedule slot
router.delete('/:id', requireAuth, deleteSchedule);

// DELETE /api/doctor-schedules/bulk - Bulk delete multiple schedule slots
router.delete('/bulk', requireAuth, bulkDeleteSchedules);

export default router;
