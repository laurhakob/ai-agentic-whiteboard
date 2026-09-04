import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!user || !email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // If user already Exist?
  const userData = await db.select().from(users).where(eq(users.email, email));

  if (userData?.length > 0) {
    return NextResponse.json(userData[0]);
  }

  //If user does not exist, create a new user in the database
  const result = await db
    .insert(users)
    .values({
      name: user.fullName,
      email: email,
    })
    .returning();

  return NextResponse.json(result[0]);
}
