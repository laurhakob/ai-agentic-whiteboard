"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Archive, LayoutGrid, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/components/ui/toast";
import CreateNewBoardDialog from "./CreateNewBoardDialog";

const NAV_ITEMS = [
  { href: "/dashboard", label: "All Files", icon: LayoutGrid },
  { href: "/dashboard/archived", label: "Archived", icon: Archive },
];

export function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [boardCount, setBoardCount] = useState<number | null>(null);
  const [archivedCount, setArchivedCount] = useState<number | null>(null);

  // Real counts, rather than the hardcoded "2 files created / total 3".
  // Re-runs on navigation so archiving a board updates the footer.
  useEffect(() => {
    let cancelled = false;

    const loadCount = async () => {
      try {
        const [active, archived] = await Promise.all([
          axios.get("/api/projects"),
          axios.get("/api/projects", { params: { archived: true } }),
        ]);

        if (cancelled) return;

        setBoardCount(Array.isArray(active.data) ? active.data.length : 0);
        setArchivedCount(
          Array.isArray(archived.data) ? archived.data.length : 0
        );
      } catch (e) {
        if (!cancelled) {
          setBoardCount(null);
          setArchivedCount(null);
        }
      }
    };

    loadCount();

    return () => {
      cancelled = true;
    };
  }, [path]);

  const openAiHelper = async () => {
    try {
      const result = await axios.get("/api/projects");
      const [mostRecent] = Array.isArray(result.data) ? result.data : [];

      if (mostRecent) {
        router.push(`/workspace/${mostRecent.projectId}?ai=1`);
        return;
      }

      const projectId = crypto.randomUUID();

      await axios.post("/api/projects", {
        projectId: projectId,
        projectName: "My first board",
      });

      router.push(`/workspace/${projectId}?ai=1`);
    } catch (e) {
      toast.add({ title: "Could not open the AI helper", type: "error" });
    }
  };

  const total =
    boardCount === null || archivedCount === null
      ? null
      : boardCount + archivedCount;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} />
          <h2 className="text-xl font-bold">WhizBoard</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <CreateNewBoardDialog />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <SidebarMenuButton
                key={item.href}
                className="p-5 mt-2 first:mt-0"
                isActive={path === item.href}
                render={<Link href={item.href} />}
              >
                <Icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            );
          })}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Others</SidebarGroupLabel>
          <SidebarMenuButton className="p-5" onClick={openAiHelper}>
            <Sparkles />
            <span>AI Helper</span>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Real counts. Credits aren't spent by anything yet, so a usage bar
            against them would be inventing a limit that doesn't exist. */}
        <div className="p-4 my-3 border rounded-md mb-1">
          <h2 className="text-sm flex justify-between">
            <span>
              {total === null ? "—" : total} {total === 1 ? "board" : "boards"}
            </span>
            {!!archivedCount && (
              <span className="text-muted-foreground">
                {archivedCount} archived
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2 p-4 border rounded-md">
          {user?.imageUrl && (
            <Image
              src={user.imageUrl}
              alt="User Image"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <h2>
            {user?.firstName} {user?.lastName}
          </h2>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
