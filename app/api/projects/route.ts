import { and, desc, eq } from "drizzle-orm";
import { db, projects, WhiteboardData } from "@/db";
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

    // ?archived=true lists the archive; anything else lists active boards.
    const archived = req.nextUrl.searchParams.get("archived") === "true";

    const result = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.userEmail, email), eq(projects.archived, archived))
      )
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

/** Archive or restore a board. */
export async function PATCH(req: NextRequest) {
  const { projectId, archived } = await req.json();

  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId || typeof archived !== "boolean") {
    return NextResponse.json(
      { error: "Project Information missing" },
      { status: 400 }
    );
  }

  try {
    const result = await db
      .update(projects)
      .set({ archived })
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, user.primaryEmailAddress.emailAddress)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (e) {
    console.error("Failed to update project", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}

/** Permanently delete a board and the canvas stored against it. */
export async function DELETE(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");

  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project Information missing" },
      { status: 400 }
    );
  }

  try {
    // Confirm the board belongs to this user before deleting anything.
    const owned = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, user.primaryEmailAddress.emailAddress)
        )
      )
      .limit(1);

    if (owned.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // The canvas row foreign-keys the project, so it has to go first.
    await db
      .delete(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectId));

    await db.delete(projects).where(eq(projects.projectId, projectId));

    return NextResponse.json({ projectId });
  } catch (e) {
    console.error("Failed to delete project", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}
