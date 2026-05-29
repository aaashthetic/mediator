import { clerkClient, getAuth } from "@clerk/express";
import { db } from "../config/db.js";
import { doctors, patients } from "../db/schema.js";

export async function onboardDoctorController(req, res, next) {
  try {
    const { userId } = getAuth(req);
     
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access token" });
    }

    // Access validated data straight from middleware attachment
    const { firstName, lastName, specialization, bio, consultationFee, medicalPracticeStartDate } = req.validatedBody;

    const clerkUser = await clerkClient.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || null;

    // Save directly into db
    await db.insert(doctors).values({
      id: userId,
      profilePicture,
      firstName,
      lastName,
      specialization,
      bio,
      isVerified: false,
      consultationFee: Number(consultationFee).toFixed(2),
      medicalPracticeStartDate: new Date(medicalPracticeStartDate),
    });

    // Update remote profiles in Clerk
    await clerkClient.users.updateUser(userId, { firstName, lastName });
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "doctor",
        onboardingComplete: true,
        doctorVerified: false,
        specialization,
      }
    });

    return res.status(200).json({ success: true, message: "Doctor onboarded successfully" });
  } catch (error) {
    console.error("Doctor Onboarding Service Failure:", error);
    // Forward to centralized error handler matching video architecture
    next(error); 
  }
}

export async function onboardPatientController(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access token" });
    }

    // Access validated data straight from middleware attachment
    const { firstName, lastName, birthday, weight, height, phone, basicMedicalHistory } = req.validatedBody;

    const clerkUser = await clerkClient.users.getUser(userId);
    const profilePicture = clerkUser.imageUrl || null;

    await db.insert(patients).values({
      id: userId,
      profilePicture,
      firstName,
      lastName,
      birthday: new Date(birthday),
      weight: weight.toString(),
      height: height.toString(),
      phone,
      basicMedicalHistory: basicMedicalHistory || null,
    });

    await clerkClient.users.updateUser(userId, { firstName, lastName });
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "patient",
        onboardingComplete: true,
        doctorVerified: true,
      }
    });

    return res.status(200).json({ success: true, message: "Patient onboarded successfully" });
  } catch (error) {
    console.error("Patient Onboarding Service Failure:", error);
    // Forward to centralized error handler matching video architecture
    next(error);
  }
}