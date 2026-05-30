import { doctorSchema, patientSchema, bookAppointmentSchema, rescheduleAppointmentSchema, patientDocumentSchema, doctorUpdateSchema, patientUpdateSchema } from "./validations.js";

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

export const validateDocument = (schema) => {
  return (req, res, next) => {
    const result = patientDocumentSchema.safeParse(req.body);
    
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

// 🩺 New: Middleware to validate Doctor Profile Updates (Partial)
export function validateDoctorUpdate(req, res, next) {
  const result = doctorUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      status: 400, error: "Validation failed", details: result.error.flatten().fieldErrors 
    });
  }
  req.validatedBody = result.data;
  next();
}

export function validatePatientUpdate(req, res, next) {
  const result = patientUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      status: 400, error: "Validation failed", details: result.error.flatten().fieldErrors 
    });
  }
  req.validatedBody = result.data;
  next();
}