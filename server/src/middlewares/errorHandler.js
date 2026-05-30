import { doctorSchema, patientSchema, bookAppointmentSchema, rescheduleAppointmentSchema } from "./validations.js";

// Middleware to intercept and validate Doctor payload
export function validateDoctor(req, res, next) {
  const result = doctorSchema.safeParse(req.body);
  
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
export function validatePatient(req, res, next) {
  const result = patientSchema.safeParse(req.body);
  
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

export function validateAppointment(req, res, next) {
  const result = bookAppointmentSchema.safeParse(req.body);
  
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

export const validateReschedule = (schema) => {
  return (req, res, next) => {
    const result = rescheduleAppointmentSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        status: 400,
        error: "Validation failed", 
        details: result.error.flatten().fieldErrors
      });
    }

    // Pass the parsed, safe results forward
    req.validatedBody = result.data;
    next();
  };
};