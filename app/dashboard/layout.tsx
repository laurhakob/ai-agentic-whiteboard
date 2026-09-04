import AppHeader from "@/components/custom/dashboard/AppHeader";
import { AppSidebar } from "@/components/custom/dashboard/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <div className="p-5">{children}</div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
