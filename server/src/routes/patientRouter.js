import { Router } from 'express';
import { updatePatient, getAllPatients, getPatientById, createPatient } from '../controllers/patientController.js';
import { validatePatient, validatePatientUpdate } from '../middlewares/errorHandler.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /api/patients - Fetch entire patient directory
router.get('/', requireAuth, getAllPatients);

// GET /api/patients/:patientId - Fetch explicit patient records
router.get('/:patientId', requireAuth, getPatientById);

// POST /api/patients - Create new patient profile (onboarding) - protected route
router.post("/", validatePatient, createPatient);

router.put("/", requireAuth, validatePatientUpdate, updatePatient);

export default router;