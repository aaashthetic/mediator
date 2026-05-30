import { Router } from 'express';
import { getAllDoctors, getDoctorById, createDoctor, updateDoctor } from '../controllers/doctorController.js';
import { validateDoctor, validateDoctorUpdate } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /api/doctors - Fetch entire medical staff directory
router.get('/', requireAuth, getAllDoctors);

// GET /api/doctors/:docId - Fetch explicit professional records with slots
router.get('/:docId', requireAuth, getDoctorById);

// POST /api/doctors - Create new doctor profile (onboarding) - protected route
router.post("/", validateDoctor, createDoctor);

router.put("/", requireAuth, validateDoctorUpdate, updateDoctor);

export default router;