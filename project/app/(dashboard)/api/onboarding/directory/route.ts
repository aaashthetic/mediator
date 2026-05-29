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

    // Safely evaluate both conditions list length and ordered directional types
    const directory = await db.query.doctors.findMany({
      where: conditions.length > 1 ? and(...conditions) : conditions[0],
      orderBy: [asc(doctors.lastName)],
    });

    return NextResponse.json({ doctors: directory }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}