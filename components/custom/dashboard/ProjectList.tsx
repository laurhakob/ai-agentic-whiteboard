"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { PenLine } from "lucide-react";
import CreateNewBoardDialog from "./CreateNewBoardDialog";

type Project = {
  id: number;
  projectId: string;
  projectName: string;
  userEmail: string;
  createdAt: string;
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

function ProjectList() {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const result = await axios.get("/api/projects");

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
  }, []);

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
    return (
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
        <h2 className="text-lg font-bold">All boards</h2>
        <span className="text-sm text-muted-foreground">
          {projectList.length} {projectList.length === 1 ? "board" : "boards"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projectList.map((project) => (
          <Link
            key={project.projectId}
            href={`/workspace/${project.projectId}`}
            className="group overflow-hidden rounded-xl border transition
                       hover:border-primary/40 hover:shadow-md
                       focus-visible:outline-2 focus-visible:outline-offset-2
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
              <h3 className="truncate font-medium" title={project.projectName}>
                {project.projectName}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCreated(project.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectList;
