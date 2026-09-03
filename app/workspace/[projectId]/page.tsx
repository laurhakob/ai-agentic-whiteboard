
"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { toast } from "@/components/ui/toast";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

function Workspace() {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [projectName, setProjectName] = useState<string | undefined>(undefined);

  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  // The board's real name for the header, instead of a hardcoded placeholder.
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const loadProject = async () => {
      try {
        const result = await axios.get("/api/projects", {
          params: { projectId: projectId },
        });

        if (!cancelled) {
          setProjectName(result.data?.projectName ?? "Untitled board");
        }
      } catch (e) {
        if (!cancelled) setProjectName("Untitled board");
      }
    };

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleExportImage = async () => {
    if (!api) return;

    try {
      // Imported here (not at the top) because @excalidraw/excalidraw
      // touches browser globals and must not run during SSR.
      const { exportToBlob } = await import("@excalidraw/excalidraw");

      const blob = await exportToBlob({
        elements: api.getSceneElements(),
        appState: {
          ...api.getAppState(),
          exportBackground: true,
        },
        files: api.getFiles(),
        mimeType: "image/png",
        quality: 1,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "whiteboard.png";
      link.click();

      URL.revokeObjectURL(url);
    } catch (e) {
      toast.add({
        title: "Failed to export image",
        type: "error",
      });
    }
  };

  return (
    <div>
      <WorkspaceHeader
        selectedTab={(value: string) => setActiveTab(value)}
        onExport={handleExportImage}
        canExport={activeTab === "whiteboard" && !!api}
        projectName={projectName}
      />

      {activeTab == "whiteboard" ? (
        <Whiteboard onApiReady={(api) => setApi(api)} />
      ) : (
        <SmartDoc />
      )}
    </div>
  );
}

export default Workspace;