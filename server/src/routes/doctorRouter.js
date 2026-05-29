import { Router } from 'express';
import { getAllDoctors, getDoctorById } from '../controllers/doctorController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// GET /api/doctors - Fetch entire medical staff directory
router.get('/', requireAuth, getAllDoctors);

// GET /api/doctors/:docId - Fetch explicit professional records with slots
router.get('/:docId', requireAuth, getDoctorById);

export default router;