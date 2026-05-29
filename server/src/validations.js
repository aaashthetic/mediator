import { z } from 'zod';

// PATIENT VALIDATION SCHEMAS
export const patientOnboardingSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(255, 'Name is too long'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(255, 'Name is too long'),
    birthday: z
        .string()
        .min(1, 'Birthday is required')
        .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
        }),
    weight: z
        .string()
        .min(1, 'Weight is required')
        .transform((val) => parseFloat(val))
        .refine((val) => val > 0 && val < 500, {
        message: 'Weight must be a valid number between 0 and 500 kg',
        }),
    height: z
        .string()
        .min(1, 'Height is required')
        .transform((val) => parseFloat(val))
        .refine((val) => val > 0 && val < 300, {
        message: 'Height must be a valid number between 0 and 300 cm',
        }),
    profilePicture: z.string().url('Invalid image URL').optional().or(z.literal('')),
    phone: z
        .string()
        .min(7, 'Contact number is too short')
        .max(50, 'Contact number is too long'),
    basicMedicalHistory: z.string().optional().or(z.literal('')),
});

// Full database row validation including the primary key string
export const patientDbSchema = patientOnboardingSchema.extend({
    id: z.string().min(1, 'Clerk user ID is required'),
});


// DOCTOR VALIDATION SCHEMAS
export const doctorOnboardingSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(255, 'Name is too long'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(255, 'Name is too long'),
    specialization: z
        .string()
        .min(2, 'Specialization must be at least 2 characters')
        .max(255, 'Specialization is too long'),
    bio: z
        .string()
        .min(10, 'Bio must be at least 10 characters long')
        .max(2000, 'Bio cannot exceed 2000 characters'),
    profilePicture: z.string().url('Invalid image URL').optional().or(z.literal('')),
    consultationFee: z.coerce
        .number()
        .min(0, 'Consultation fee cannot be negative')
        .default(500),
    medicalPracticeStartDate: z
        .string()
        .min(1, 'Medical practice start date is required')
        .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
        }),
});

export const doctorDbSchema = doctorOnboardingSchema.extend({
    id: z.string().min(1, 'Clerk user ID is required'),
    isVerified: z.boolean().default(false),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});


// APPOINTMENT & SCHEDULE SCHEMAS
export const createScheduleSchema = z.object({
    startTime: z.string().datetime({ message: "Invalid ISO datetime string" }),
    endTime: z.string().datetime({ message: "Invalid ISO datetime string" }),
}).refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
});

export const bookAppointmentSchema = z.object({
    doctorId: z.string().min(1, 'Doctor selection is required'),
    scheduleId: z.string().uuid('Invalid schedule identifier'),
});


// CONSULTATION & MEDICAL RECORDS SCHEMA
export const medicalRecordFormSchema = z.object({
    consultationNotes: z
        .string()
        .min(5, 'Consultation notes must be descriptive')
        .max(5000),
    prescriptions: z.string().optional().or(z.literal('')),
});