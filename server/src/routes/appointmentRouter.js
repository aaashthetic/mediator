import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment, rescheduleAppointment, cancelAppointment, deleteAppointment, saveConsultationNotes } from '../controllers/appointmentController.js';
import { validateAppointment } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// POST /api/appointments - Secure a fresh reservation slot via transaction block
router.post('/', requireAuth, validateAppointment, createAppointment);

// PUT /api/appointments/:id/reschedule - Reschedule an existing appointment with new slot
router.put('/:id/reschedule', requireAuth, rescheduleAppointment);

// PUT /api/appointments/:id/cancel - Cancel an existing appointment and free up the slot
router.put('/:id/cancel', requireAuth, cancelAppointment);

// DELETE /api/appointments/:id - Permanently delete an appointment record
router.delete('/:id', requireAuth, deleteAppointment);

// GET /api/appointments - Fetch list of appointments scoped by user roles and queries
router.get('/', requireAuth, getAppointments);

// GET /api/appointments/:id - Fetch individual appointment with full participant details
router.get('/:id', requireAuth, getAppointmentById);

// POST /api/appointments/:id/notes - Save consultation notes (doctor only)
router.post('/:id/notes', requireAuth, saveConsultationNotes);

export default router;