import { pgTable, uuid, varchar, text, timestamp, date, decimal, pgEnum, boolean, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('user_role', ['patient', 'doctor', 'admin']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['pending', 'confirmed', 'rescheduled', 'cancelled', 'completed']);
export const notificationStatusEnum = pgEnum('notification_status', ['unread', 'read']);


// PATIENTS TABLE
export const patients = pgTable('patients', {
  id: varchar('id', { length: 255 }).primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  birthday: date('birthday').notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }).notNull(),
  height: decimal('height', { precision: 5, scale: 2 }).notNull(),
  profilePicture: text('profile_picture'),
  phone: varchar('phone', { length: 50 }).notNull(),
  basicMedicalHistory: text('basic_medical_history'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});


// DOCTORS TABLE
export const doctors = pgTable('doctors', {
  id: varchar('id', { length: 255 }).primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  specialization: varchar('specialization', { length: 255 }).notNull(),
  bio: text('bio').notNull(),
  profilePicture: text('profile_picture'),
  isVerified: boolean('is_verified').default(false).notNull(),
  consultationFee: decimal('consultation_fee', { precision: 10, scale: 2 }).default('500.00').notNull(),
  medicalPracticeStartDate: timestamp('medical_practice_start_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('specialization_idx').on(table.specialization),
]);


// DOCTOR AVAILABILITY SLOTS
export const doctorSchedules = pgTable('doctor_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  doctorId: varchar('doctor_id', { length: 255 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  isBooked: boolean('is_booked').default(false).notNull(),
}, (table) => [
  index('doctor_schedule_idx').on(table.doctorId, table.startTime),
]);


// APPOINTMENTS TABLE
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: varchar('patient_id', { length: 255 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 255 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  scheduleId: uuid('schedule_id')
    .references(() => doctorSchedules.id)
    .notNull(),
  status: appointmentStatusEnum('status').default('pending').notNull(),
  roomUrl: text('room_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// MEDICAL RECORDS & CONSULTATION NOTES
export const medicalRecords = pgTable('medical_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id')
    .references(() => appointments.id, { onDelete: 'cascade' })
    .notNull(),
  patientId: varchar('patient_id', { length: 255 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 255 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  consultationNotes: text('consultation_notes').notNull(),
  prescriptions: text('prescriptions'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});


// REAL-TIME NOTIFICATIONS
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: notificationStatusEnum('status').default('unread').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('user_notification_idx').on(table.userId),
]);


// RELATIONS
export const patientRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
}));

export const doctorRelations = relations(doctors, ({ many }) => ({
  schedules: many(doctorSchedules),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
}));

export const doctorSchedulesRelations = relations(doctorSchedules, ({ one }) => ({
  doctor: one(doctors, { fields: [doctorSchedules.doctorId], references: [doctors.id] }),
  appointment: one(appointments)
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  schedule: one(doctorSchedules, { fields: [appointments.scheduleId], references: [doctorSchedules.id] }),
  medicalRecord: one(medicalRecords),
}));

export const medicalRecordRelations = relations(medicalRecords, ({ one }) => ({
  appointment: one(appointments, { fields: [medicalRecords.appointmentId], references: [appointments.id] }),
  patient: one(patients, { fields: [medicalRecords.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [medicalRecords.doctorId], references: [doctors.id] }),
}));