import { and, desc, eq } from "drizzle-orm";
import { db, projects } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectName, projectId } = await req.json();

  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId || !projectName) {
    return NextResponse.json(
      { error: "Project Information missing" },
      { status: 400 }
    );
  }

  try {
    const result = await db
      .insert(projects)
      .values({
        projectId: projectId,
        projectName: projectName,
        userEmail: user.primaryEmailAddress.emailAddress,
      })
      .returning();

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Failed to create project", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  const email = user.primaryEmailAddress.emailAddress;
  const projectId = req.nextUrl.searchParams.get("projectId");

  try {
    // With a projectId this returns that one board (still scoped to the user,
    // so nobody can read someone else's by guessing the id); without one it
    // returns the whole list for the dashboard.
    if (projectId) {
      const result = await db
        .select()
        .from(projects)
        .where(
          and(eq(projects.projectId, projectId), eq(projects.userEmail, email))
        )
        .limit(1);

      return NextResponse.json(result[0] ?? null);
    }

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.userEmail, email))
      .orderBy(desc(projects.createdAt));

    return NextResponse.json(result);
  } catch (e) {
    console.error("Failed to load projects", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}
