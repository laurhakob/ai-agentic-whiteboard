import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}

export default WorkspaceLayout;
