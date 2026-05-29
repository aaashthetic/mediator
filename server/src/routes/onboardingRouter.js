import express from "express";
import { 
  onboardDoctorController, 
  onboardPatientController 
} from "../controllers/onboardingController.js";
import { 
  validateDoctorOnboarding, 
  validatePatientOnboarding 
} from "../middlewares/errorHandler.js";

const router = express.Router();

// Onboarding endpoints
router.post("/doctor", validateDoctorOnboarding, onboardDoctorController);
router.post("/patient", validatePatientOnboarding, onboardPatientController);

export default router;