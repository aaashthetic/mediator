import { Router } from 'express';
import { getAppointments, getAppointmentById, createAppointment } from '../controllers/appointmentController.js';
import { validateAppointment } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// POST /api/appointments - Secure a fresh reservation slot via transaction block
router.post('/', requireAuth, validateAppointment, createAppointment);

// GET /api/appointments - Fetch list of appointments scoped by user roles and queries
router.get('/', requireAuth, getAppointments);

// GET /api/appointments/:id - Fetch individual appointment with full participant details
router.get('/:id', requireAuth, getAppointmentById);

export default router;