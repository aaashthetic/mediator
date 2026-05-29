import { doctorOnboardingSchema, patientOnboardingSchema } from "../validations.js";

// Middleware to intercept and validate Doctor payload
export function validateDoctorOnboarding(req, res, next) {
  const result = doctorOnboardingSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      status: 400,
      error: "Validation failed", 
      details: result.error.flatten().fieldErrors 
    });
  }
  
  // Attach sanitized data to request object for the controller
  req.validatedBody = result.data;
  next();
}

// Middleware to intercept and validate Patient payload
export function validatePatientOnboarding(req, res, next) {
  const result = patientOnboardingSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      status: 400,
      error: "Validation failed", 
      details: result.error.flatten().fieldErrors 
    });
  }
  
  // Attach sanitized data to request object for the controller
  req.validatedBody = result.data;
  next();
}