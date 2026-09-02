"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/toast";
import "./whiteboard.css";
import {
  ArrowRight,
  Circle,
  Diamond,
  Eraser,
  Hand,
  Image,
  Minus,
  MousePointer2,
  Pencil,
  Sparkles,
  Square,
  Type,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import FloatingProperties from "./FloatingProperties";
import AIFloatingSidebar from "./AIFloatingSidebar";
import { Button } from "@/components/ui/button";

const tools = [
  {
    name: "selection",
    icon: MousePointer2,
    color: "text-blue-600",
  },
  {
    name: "hand",
    icon: Hand,
    color: "text-cyan-600",
  },
  {
    name: "rectangle",
    icon: Square,
    color: "text-blue-600",
  },
  {
    name: "diamond",
    icon: Diamond,
    color: "text-emerald-500",
  },
  {
    name: "ellipse",
    icon: Circle,
    color: "text-amber-500",
  },
  {
    name: "arrow",
    icon: ArrowRight,
    color: "text-violet-500",
  },
  {
    name: "line",
    icon: Minus,
    color: "text-pink-500",
  },
  {
    name: "freedraw",
    icon: Pencil,
    color: "text-orange-500",
  },
  {
    name: "text",
    icon: Type,
    color: "text-indigo-500",
  },
  {
    name: "image",
    icon: Image,
    color: "text-green-500",
  },
  {
    name: "eraser",
    icon: Eraser,
    color: "text-rose-500",
  },
];

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

// `collaborators` is a Map and the pointer/cursor fields are transient, so they
// can't survive a JSON round trip. Keep only what is worth restoring.
const sanitizeAppState = (appState: any) => {
  if (!appState) return undefined;

  const {
    collaborators,
    cursorButton,
    draggingElement,
    editingElement,
    resizingElement,
    selectionElement,
    ...rest
  } = appState;

  return rest;
};

type Props = {
  onApiReady?: (api: ExcalidrawImperativeAPI | null) => void;
};

function Whiteboard({ onApiReady }: Props) {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const saveTimeRef = useRef<any>(null);
  const pendingSaveRef = useRef<any>(null);
  const params = useParams();
  const projectId = params?.projectId as string | undefined;
  const [activeTool, setActiveTool] = useState("selection");
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [canvasState, setCanvasState] = useState<any>(null);
  const [showAiSidebar, setShowAiSidebar] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kept in a ref so the unmount cleanup below never re-runs when the parent
  // passes a new inline arrow function on every render.
  const onApiReadyRef = useRef(onApiReady);
  onApiReadyRef.current = onApiReady;

  // Tell the parent the API is gone when this component unmounts
  // (e.g. switching to the doc tab), so it can't export a dead canvas.
  useEffect(() => {
    return () => {
      onApiReadyRef.current?.(null);
    };
  }, []);

  // Load the saved scene before mounting Excalidraw, so a refresh restores it.
  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    const loadCanvas = async () => {
      try {
        const result = await axios.get("/api/whiteboard", {
          params: { projectId: projectId },
        });

        if (cancelled) return;

        const data = result.data;

        setInitialData({
          elements: data?.elements ?? [],
          appState: sanitizeAppState(data?.appState),
          files: data?.files ?? {},
          scrollToContent: true,
        });
      } catch (e) {
        if (!cancelled) setInitialData({ elements: [], files: {} });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadCanvas();

    return () => {
      cancelled = true;

      // Unmounting (e.g. switching to the doc tab) shouldn't drop a pending save.
      if (saveTimeRef.current) {
        clearTimeout(saveTimeRef.current);
        saveTimeRef.current = null;

        if (pendingSaveRef.current) {
          const { elements, appState, files } = pendingSaveRef.current;
          SaveCanvasChanges(elements, appState, files);
        }
      }
    };
  }, [projectId]);

  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any
  ) => {
    setCanvasState(appState);

    const selectedIds = Object.keys(appState.selectedElementIds || {});

    if (selectedIds?.length == 1) {
      const element = elements.find((element) => element.id == selectedIds[0]);

      setSelectedElement(element);
    } else {
      setSelectedElement(null);
    }

    // Don't persist anything until the saved scene has been loaded,
    // otherwise the initial empty canvas overwrites it.
    if (isLoading) return;

    //Cancel Prev Timer
    if (saveTimeRef?.current) {
      clearTimeout(saveTimeRef.current);
    }

    pendingSaveRef.current = { elements, appState, files };

    //Start New Timer
    saveTimeRef.current = setTimeout(() => {
      saveTimeRef.current = null;
      pendingSaveRef.current = null;
      SaveCanvasChanges(elements, appState, files);
    }, 2000);
  };

  const SaveCanvasChanges = async (
    elements: readonly any[],
    appState: any,
    files: any
  ) => {
    if (!projectId) return;

    try {
      await axios.post("/api/whiteboard", {
        elements: elements,
        appState: sanitizeAppState(appState),
        files: files ?? {},
        projectId: projectId,
      });
    } catch (e) {
      toast.add({
        title: "Failed to save changes",
        type: "error",
      });
    }
  };

  const changeTool = (tool: any) => {
    if (!excalidrawAPI) return;

    setActiveTool(tool);
    excalidrawAPI.setActiveTool({
      type: tool,
    });
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();

    const updatedElements = elements.map((element: any) => {
      if (element.id !== selectedElement.id) {
        return element;
      }

      return {
        ...element,
        [property]: value,
        version: element.version + 1,
        versionNonce: Math.floor(Math.random() * 2 ** 31),
        updated: Date.now(),
      };
    });

    excalidrawAPI.updateScene({
      elements: updatedElements,
    });

    setSelectedElement({ ...selectedElement, [property]: value });
  };

  const handleDeleteElement = () => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();

    excalidrawAPI.updateScene({
      elements: elements.map((element: any) =>
        element.id === selectedElement.id
          ? { ...element, isDeleted: true }
          : element
      ),
      appState: { selectedElementIds: {} },
    });

    setSelectedElement(null);
  };

  const handleDuplicateElement = () => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();
    const newId = crypto.randomUUID();

    const copy = {
      ...selectedElement,
      id: newId,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      seed: Math.floor(Math.random() * 2 ** 31),
      versionNonce: Math.floor(Math.random() * 2 ** 31),
      updated: Date.now(),
    };

    excalidrawAPI.updateScene({
      elements: [...elements, copy],
      appState: { selectedElementIds: { [newId]: true } },
    });
  };

  const handleLock = () => {
    handlePropertyChange("locked", !selectedElement?.locked);
  };

  const handleBringToFront = () => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();
    const target = elements.find((el: any) => el.id === selectedElement.id);

    if (!target) return;

    const rest = elements.filter((el: any) => el.id !== selectedElement.id);

    excalidrawAPI.updateScene({ elements: [...rest, target] });
  };

  const handleSendToBack = () => {
    if (!excalidrawAPI || !selectedElement) return;

    const elements = excalidrawAPI.getSceneElements();
    const target = elements.find((el: any) => el.id === selectedElement.id);

    if (!target) return;

    const rest = elements.filter((el: any) => el.id !== selectedElement.id);

    excalidrawAPI.updateScene({ elements: [target, ...rest] });
  };

  const getFloatingPosition = () => {
    if (!selectedElement || !canvasState) {
      return { left: 0, top: 0 };
    }

    const zoom = canvasState.zoom?.value ?? 1;

    const scrollX = canvasState.scrollX ?? 0;

    const scrollY = canvasState.scrollY ?? 0;

    // Center of selected element
    const centerX = selectedElement.x + selectedElement.width / 2;

    // Convert Excalidraw coordinates
    // into browser coordinates
    const screenX = (centerX + scrollX) * zoom;

    const screenY = (selectedElement.y + scrollY) * zoom;

    return {
      left: screenX,
      top: screenY - 60,
    };
  };

  const floatingPosition = getFloatingPosition();

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height: "90vh" }}
      >
        Loading board...
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "90vh" }}>
      <Excalidraw
        //@ts-ignore
        excalidrawAPI={(api) => {
          setExcalidrawAPI(api);
          onApiReady?.(api);
        }}
        initialData={initialData}
        onChange={handleCanvasChange}
      />
      <div className="absolute left-4 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white border p-1.5 shadow-xl">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.name}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-primary/10 hover:cursor-pointer ${activeTool == tool.name ? "bg-primary/10" : null} `}
              onClick={() => changeTool(tool.name)}
            >
              <Icon size="19" className={tool.color} />
            </button>
          );
        })}
      </div>

      <FloatingProperties
        selectedElement={selectedElement}
        position={floatingPosition}
        onDelete={handleDeleteElement}
        onDuplicate={handleDuplicateElement}
        onLock={handleLock}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onPropertyChange={(property, value) =>
          handlePropertyChange(property, value)
        }
      />

      <div className="absolute right-15 bottom-7 z-50">
        <Button size={"lg"} onClick={() => setShowAiSidebar(!showAiSidebar)}>
          <Sparkles /> AI
        </Button>
      </div>

      {showAiSidebar && (
        <AIFloatingSidebar
          excalidrawApi={excalidrawAPI}
          onClose={() => setShowAiSidebar(false)}
        />
      )}
    </div>
  );
}

export default Whiteboard;