import { eq } from "drizzle-orm";
import { db } from "@/db";
import { WhiteboardData } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { projectId, elements, files, appState } = await req.json();
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project information missing!" },
      { status: 400 }
    );
  }

  try {
    const result = await db
      .insert(WhiteboardData)
      .values({
        projectId: projectId,
        elements: elements,
        appState: appState,
        files: files,
      })
      .onConflictDoUpdate({
        target: WhiteboardData.projectId,
        set: {
          elements: elements,
          appState: appState,
          files: files,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Failed to save whiteboard", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  if (!projectId) {
    return NextResponse.json(
      { error: "Project information missing!" },
      { status: 400 }
    );
  }

  try {
    const result = await db
      .select()
      .from(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectId))
      .limit(1);

    return NextResponse.json(result[0] ?? null);
  } catch (e) {
    console.error("Failed to load whiteboard", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}
