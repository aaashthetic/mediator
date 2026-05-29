import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { eq, and, ilike, or, asc } from "drizzle-orm";
import { doctors } from "@/lib/db/schema";
import { z } from "zod";

const querySchema = z.object({
  search: z.string().optional().default(""),
  specialization: z.string().optional().default("all"),
});

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      search: searchParams.get("search") || undefined,
      specialization: searchParams.get("specialization") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid lookup filters" }, { status: 400 });
    }

    const { search, specialization } = parsed.data;

    // Build matching query array variables
    const conditions = [eq(doctors.isVerified, true)];

    if (search) {
        // Filter out any potential undefined array slots explicitly
        const searchMatch = [
            ilike(doctors.firstName, `%${search}%`),
            ilike(doctors.lastName, `%${search}%`),
            ilike(doctors.bio, `%${search}%`)
        ].filter(Boolean);

        // Use the spread operator inside or() safely now that the array is strictly typed
        if (searchMatch.length > 0) {
            conditions.push(or(...searchMatch));
        }
    }

    if (specialization && specialization !== "all") {
      conditions.push(eq(doctors.specialization, specialization));
    }

    const directory = await db.query.doctors.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      orderBy: [asc(doctors.lastName)],
    });

    // Calculate years of experience
    const formattedDoctors = directory.map((doc) => {
      let yearsOfExperience = 0;

      if (doc.medicalPracticeStartDate) {
        const startDate = new Date(doc.medicalPracticeStartDate);
        const currentDate = new Date();
        
        yearsOfExperience = currentDate.getFullYear() - startDate.getFullYear();
        
        const anniversaryPassed = 
          currentDate.getMonth() > startDate.getMonth() || 
          (currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() >= startDate.getDate());
          
        if (!anniversaryPassed) {
          yearsOfExperience--;
        }
      }

      return {
        ...doc,
        // Ensure it matches your component's camelCase signature and isn't negative
        yearsOfExperience: Math.max(0, yearsOfExperience), 
      };
    });

    return NextResponse.json({ doctors: formattedDoctors }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}