
"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon, Save, Share } from "lucide-react";

type Props = {
  selectedTab: (value: string) => void;
  onExport?: () => void;
  canExport?: boolean;
  /** Undefined while the board is still being fetched. */
  projectName?: string;
};

function WorkspaceHeader({
  selectedTab,
  onExport,
  canExport = true,
  projectName,
}: Props) {
  return (
    <div className="p-3 border-b flex justify-between">
      <div className="flex gap-2 items-center">
        {/* `render` makes the Button an <a>; an <a> can't contain a <button>. */}
        <Button
          variant="ghost"
          size="icon"
          title="Back to dashboard"
          aria-label="Back to dashboard"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft />
        </Button>

        <Image src={"/logo.svg"} alt="logo" width={35} height={35} />

        {projectName === undefined ? (
          <span className="h-5 w-36 animate-pulse rounded bg-muted" />
        ) : (
          <h2 className="max-w-64 truncate font-medium" title={projectName}>
            {projectName}
          </h2>
        )}
      </div>
      {/* Switch */}
      <div>
        <Tabs
          defaultValue="whiteboard"
          className="w-100"
          onValueChange={(value) => selectedTab(value)}
        >
          <TabsList>
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="doc">Doc</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex gap-2">
        <Button>
          <Save /> Save
        </Button>
        <Button variant={"outline"}>
          <Share /> Share
        </Button>
        <Button onClick={onExport} disabled={!canExport} variant={"outline"}>
          <DownloadIcon /> Export
        </Button>
      </div>
    </div>
  );
}

export default WorkspaceHeader;