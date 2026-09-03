"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  PenLine,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateNewBoardDialog from "./CreateNewBoardDialog";

export type Project = {
  id: number;
  projectId: string;
  projectName: string;
  userEmail: string;
  archived: boolean;
  createdAt: string;
};

type Props = {
  /** Which shelf to show: the active boards, or the archive. */
  archived?: boolean;
};

/** Each board gets a stable colour from its id, so the grid isn't monotone. */
const CARD_GRADIENTS = [
  "from-blue-200 to-indigo-200",
  "from-amber-200 to-orange-200",
  "from-emerald-200 to-teal-200",
  "from-pink-200 to-rose-200",
  "from-violet-200 to-purple-200",
  "from-cyan-200 to-sky-200",
];

const gradientFor = (projectId: string) => {
  let hash = 0;

  for (let i = 0; i < projectId.length; i++) {
    hash = (hash * 31 + projectId.charCodeAt(i)) >>> 0;
  }

  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
};

const formatCreated = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `Created ${formatDistanceToNow(date, { addSuffix: true })}`;
};

function ProjectList({ archived = false }: Props) {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  /** The board awaiting delete confirmation, if any. */
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      setLoading(true);

      try {
        const result = await axios.get("/api/projects", {
          params: { archived: archived },
        });

        if (!cancelled) {
          setProjectList(Array.isArray(result.data) ? result.data : []);
        }
      } catch (e) {
        if (!cancelled) setProjectList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [archived]);

  const setArchived = async (project: Project, nextArchived: boolean) => {
    setBusyId(project.projectId);

    try {
      await axios.patch("/api/projects", {
        projectId: project.projectId,
        archived: nextArchived,
      });

      // It has moved to the other shelf, so drop it from this one.
      setProjectList((current) =>
        current.filter((item) => item.projectId !== project.projectId)
      );

      toast.add({
        title: nextArchived ? "Board archived" : "Board restored",
        type: "success",
      });
    } catch (e) {
      toast.add({
        title: nextArchived
          ? "Failed to archive board"
          : "Failed to restore board",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const deleteProject = async (project: Project) => {
    setPendingDelete(null);
    setBusyId(project.projectId);

    try {
      await axios.delete("/api/projects", {
        params: { projectId: project.projectId },
      });

      setProjectList((current) =>
        current.filter((item) => item.projectId !== project.projectId)
      );

      toast.add({ title: "Board deleted", type: "success" });
    } catch (e) {
      toast.add({ title: "Failed to delete board", type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-10">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="overflow-hidden rounded-xl border">
              <div className="h-28 animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (projectList.length === 0) {
    return archived ? (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border p-10">
        <Archive size={44} className="text-muted-foreground" />
        <h2 className="text-2xl font-bold">Nothing archived</h2>
        <p className="text-muted-foreground">
          Boards you archive are kept here, out of the way but not deleted.
        </p>
      </div>
    ) : (
      <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border p-10">
        <Image src="/folder.png" alt="Folder" width={90} height={90} />
        <h2 className="text-2xl font-bold">No Boards Found</h2>
        <p className="text-muted-foreground">
          Create your first board to start brainstorming
        </p>
        <CreateNewBoardDialog />
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">
          {archived ? "Archived boards" : "All boards"}
        </h2>
        <span className="text-sm text-muted-foreground">
          {projectList.length} {projectList.length === 1 ? "board" : "boards"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projectList.map((project) => (
          <div
            key={project.projectId}
            className={`group relative overflow-hidden rounded-xl border transition
                        hover:border-primary/40 hover:shadow-md
                        ${busyId === project.projectId ? "opacity-50" : ""}`}
          >
            {/* The link covers the whole card; the menu below sits above it. */}
            <Link
              href={`/workspace/${project.projectId}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-primary"
            >
              <div
                className={`flex h-28 items-center justify-center bg-linear-to-r
                            ${gradientFor(project.projectId)}`}
              >
                <PenLine
                  size={26}
                  className="text-black/30 transition group-hover:scale-110"
                />
              </div>

              <div className="p-4">
                <h3 className="truncate pr-8 font-medium" title={project.projectName}>
                  {project.projectName}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCreated(project.createdAt)}
                </p>
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Board options"
                disabled={busyId === project.projectId}
                className="absolute right-2 bottom-4 rounded-md p-1.5 text-muted-foreground
                           opacity-0 transition hover:bg-muted focus-visible:opacity-100
                           group-hover:opacity-100"
              >
                <MoreHorizontal size={17} />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {archived ? (
                  <DropdownMenuItem
                    onClick={() => setArchived(project, false)}
                    className="gap-2"
                  >
                    <ArchiveRestore size={15} />
                    Restore board
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => setArchived(project, true)}
                    className="gap-2"
                  >
                    <Archive size={15} />
                    Archive board
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setPendingDelete(project)}
                  className="gap-2"
                >
                  <Trash2 size={15} />
                  Delete board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* Deleting takes the canvas with it and can't be undone, so confirm. */}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{pendingDelete?.projectName}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the board and everything drawn on it.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {/* Both already render a Button internally, so they take the
                variant directly — a `render` here would nest buttons. */}
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => pendingDelete && deleteProject(pendingDelete)}
            >
              Delete board
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ProjectList;
