
"use client";
import SmartDoc from "@/components/custom/workspace/SmartDoc";
import Whiteboard from "@/components/custom/workspace/Whiteboard";
import WorkspaceHeader from "@/components/custom/workspace/WorkspaceHeader";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { toast } from "@/components/ui/toast";
import React, { useState } from "react";

function Workspace() {
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

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