// "use client";

// import React, { useState } from "react";
// import {
//   CornerDownLeft,
//   Loader2,
//   Monitor,
//   Network,
//   PencilRuler,
//   Smartphone,
//   Sparkles,
//   Workflow,
//   X,
// } from "lucide-react";
// import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

// type Props = {
//   excalidrawApi: ExcalidrawImperativeAPI | null;
//   onClose?: () => void;
//   onGenerate?: (tool: string, prompt: string) => Promise<void> | void;
// };

// const AI_TOOLS = [
//   {
//     id: "diagram",
//     name: "Diagram",
//     desc: "Boxes and connections from a description",
//     icon: PencilRuler,
//     accent: "text-blue-600",
//     tint: "bg-blue-50",
//     selected: "border-blue-200 bg-blue-50/70",
//     placeholder:
//       "Eg. Client sends a request to the API, which reads from a cache before hitting the database",
//   },
//   {
//     id: "flowchart",
//     name: "Flowchart",
//     desc: "Steps and decision points in order",
//     icon: Workflow,
//     accent: "text-violet-600",
//     tint: "bg-violet-50",
//     selected: "border-violet-200 bg-violet-50/70",
//     placeholder:
//       "Eg. Customer onboarding, branching on whether their email is already registered",
//   },
//   {
//     id: "architecture",
//     name: "Architecture",
//     desc: "Services, storage, and how they connect",
//     icon: Network,
//     accent: "text-orange-600",
//     tint: "bg-orange-50",
//     selected: "border-orange-200 bg-orange-50/70",
//     placeholder:
//       "Eg. Next.js frontend, Postgres, a queue worker, and an S3 bucket for uploads",
//   },
//   {
//     id: "web-mockup",
//     name: "Web mockup",
//     desc: "Page layout and wireframe blocks",
//     icon: Monitor,
//     accent: "text-cyan-600",
//     tint: "bg-cyan-50",
//     selected: "border-cyan-200 bg-cyan-50/70",
//     placeholder:
//       "Eg. Pricing page with three plan columns and a comparison table underneath",
//   },
//   {
//     id: "mobile-mockup",
//     name: "Mobile mockup",
//     desc: "App screens and navigation",
//     icon: Smartphone,
//     accent: "text-pink-600",
//     tint: "bg-pink-50",
//     selected: "border-pink-200 bg-pink-50/70",
//     placeholder:
//       "Eg. Sign-up flow across three screens, ending on a home feed with a tab bar",
//   },
// ];

// const MAX_PROMPT = 400;

// function AIFloatingSidebar({ excalidrawApi, onClose, onGenerate }: Props) {
//   const [activeTool, setActiveTool] = useState(AI_TOOLS[0]);
//   const [prompt, setPrompt] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);

//   const canGenerate = prompt.trim().length > 0 && !isGenerating;

//   const handleGenerate = async () => {
//     if (!canGenerate) return;

//     setIsGenerating(true);
//     try {
//       // The AI call and canvas injection will go here.
//       // excalidrawApi.updateScene({ elements: [...] })
//       await onGenerate?.(activeTool.id, prompt.trim());
//       setPrompt("");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
//       e.preventDefault();
//       handleGenerate();
//     }
//   };

//   return (
//     <div
//       role="dialog"
//       aria-label="AI helper"
//       className="absolute bottom-24 right-6 z-50 flex max-h-155 w-95
//                 flex-col overflow-hidden rounded-2xl border border-gray-200
//                 bg-white shadow-2xl shadow-gray-900/10"
//     >
//       {/* Header */}
//       <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-5">
//         <div>
//           <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
//             <Sparkles size={17} className="text-violet-600" />
//             AI helper
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             Describe it, and it lands on your canvas.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onClose}
//           aria-label="Close AI helper"
//           className="-mr-1 -mt-1 rounded-lg p-1.5 text-gray-400
//                     transition hover:bg-gray-100 hover:text-gray-600
//                     focus-visible:outline-2 focus-visible:outline-offset-2
//                     focus-visible:outline-violet-500"
//         >
//           <X size={16} />
//         </button>
//       </header>

//       {/* Tool selector */}
//       <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
//         <div className="flex flex-col gap-1">
//           {AI_TOOLS.map((tool) => {
//             const Icon = tool.icon;
//             const isActive = tool.id === activeTool.id;

//             return (
//               <button
//                 key={tool.id}
//                 type="button"
//                 aria-pressed={isActive}
//                 onClick={() => setActiveTool(tool)}
//                 className={`flex items-center gap-3 rounded-xl border px-2.5 py-2 text-left
//                             transition focus-visible:outline-2
//                             focus-visible:outline-offset-2 focus-visible:outline-violet-500
//                   ${
//                     isActive
//                       ? tool.selected
//                       : "border-transparent hover:bg-gray-50"
//                   }`}
//               >
//                 <span
//                   className={`flex h-9 w-9 shrink-0 items-center justify-center
//                               rounded-lg ${tool.tint} ${tool.accent}`}
//                 >
//                   <Icon size={17} />
//                 </span>

//                 <span className="min-w-0">
//                   <span className="block truncate text-sm font-medium text-gray-900">
//                     {tool.name}
//                   </span>
//                   <span className="block truncate text-xs text-gray-500">
//                     {tool.desc}
//                   </span>
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Prompt */}
//       <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 p-4">
//         <Textarea
//           value={prompt}
//           maxLength={MAX_PROMPT}
//           onChange={(e) => setPrompt(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder={activeTool.placeholder}
//           className="min-h-21 resize-none border-gray-200 bg-white text-sm
//                     placeholder:text-gray-400 focus-visible:ring-violet-500/30"
//         />

//         <div className="mt-3 flex items-center justify-between gap-3">
//           <span className="text-xs tabular-nums text-gray-400">
//             {prompt.length}/{MAX_PROMPT}
//           </span>

//           <Button
//             onClick={handleGenerate}
//             disabled={!canGenerate}
//             className="flex items-center gap-2"
//           >
//             {isGenerating ? (
//               <>
//                 <Loader2 size={15} className="animate-spin" />
//                 Generating
//               </>
//             ) : (
//               <>
//                 <Sparkles size={15} />
//                 Generate
//                 <CornerDownLeft size={13} className="opacity-50" />
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AIFloatingSidebar;

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// "use client";

// import React, { useState } from "react";
// import {
//   CornerDownLeft,
//   Loader2,
//   Monitor,
//   Network,
//   PencilRuler,
//   Smartphone,
//   Sparkles,
//   Workflow,
//   X,
// } from "lucide-react";
// import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

// type Props = {
//   excalidrawApi: ExcalidrawImperativeAPI | null;
//   onClose?: () => void;
//   onGenerate?: (tool: string, prompt: string) => Promise<void> | void;
// };

// const AI_PLACEHOLDER_ID = "ai-generation-placeholder";

// const AI_TOOLS = [
//   {
//     id: "diagram",
//     name: "Diagram",
//     desc: "Boxes and connections from a description",
//     icon: PencilRuler,
//     accent: "text-blue-600",
//     tint: "bg-blue-50",
//     selected: "border-blue-200 bg-blue-50/70",
//     placeholder:
//       "Eg. Client sends a request to the API, which reads from a cache before hitting the database",
//   },
//   {
//     id: "flowchart",
//     name: "Flowchart",
//     desc: "Steps and decision points in order",
//     icon: Workflow,
//     accent: "text-violet-600",
//     tint: "bg-violet-50",
//     selected: "border-violet-200 bg-violet-50/70",
//     placeholder:
//       "Eg. Customer onboarding, branching on whether their email is already registered",
//   },
//   {
//     id: "architecture",
//     name: "Architecture",
//     desc: "Services, storage, and how they connect",
//     icon: Network,
//     accent: "text-orange-600",
//     tint: "bg-orange-50",
//     selected: "border-orange-200 bg-orange-50/70",
//     placeholder:
//       "Eg. Next.js frontend, Postgres, a queue worker, and an S3 bucket for uploads",
//   },
//   {
//     id: "web-mockup",
//     name: "Web mockup",
//     desc: "Page layout and wireframe blocks",
//     icon: Monitor,
//     accent: "text-cyan-600",
//     tint: "bg-cyan-50",
//     selected: "border-cyan-200 bg-cyan-50/70",
//     placeholder:
//       "Eg. Pricing page with three plan columns and a comparison table underneath",
//   },
//   {
//     id: "mobile-mockup",
//     name: "Mobile mockup",
//     desc: "App screens and navigation",
//     icon: Smartphone,
//     accent: "text-pink-600",
//     tint: "bg-pink-50",
//     selected: "border-pink-200 bg-pink-50/70",
//     placeholder:
//       "Eg. Sign-up flow across three screens, ending on a home feed with a tab bar",
//   },
// ];

// const MAX_PROMPT = 400;

// function AIFloatingSidebar({ excalidrawApi, onClose, onGenerate }: Props) {
//   const [activeTool, setActiveTool] = useState(AI_TOOLS[0]);
//   const [prompt, setPrompt] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);

//   const canGenerate = prompt.trim().length > 0 && !isGenerating;

//   /* ----------------------------------------------------------------
//      Find an empty spot on the canvas for the new content
//      ---------------------------------------------------------------- */

//   const getEmptyCanvasPosition = () => {
//     if (!excalidrawApi) {
//       return { x: 100, y: 100 };
//     }

//     const elements = excalidrawApi
//       .getSceneElements()
//       .filter((element: any) => !element.isDeleted);

//     if (elements.length === 0) {
//       return { x: 100, y: 100 };
//     }

//     // Find right-most element
//     const maxRight = Math.max(
//       ...elements.map((element: any) => element.x + element.width)
//     );
//     const minTop = Math.min(...elements.map((element: any) => element.y));

//     return {
//       x: maxRight + 150,
//       y: minTop,
//     };
//   };

//   /* ----------------------------------------------------------------
//      Placeholder card shown while the AI is working
//      ---------------------------------------------------------------- */

//   const addAiPlaceholder = async () => {
//     if (!excalidrawApi) return null;

//     const { convertToExcalidrawElements } =
//       await import("@excalidraw/excalidraw");

//     const position = getEmptyCanvasPosition();

//     const placeholderElements = convertToExcalidrawElements([
//       {
//         type: "rectangle",
//         id: AI_PLACEHOLDER_ID,
//         x: position.x,
//         y: position.y,
//         width: 420,
//         height: 250,
//         backgroundColor: "#f5f3ff",
//         strokeColor: "#8b5cf6",
//         fillStyle: "solid",
//         strokeWidth: 2,
//         roughness: 0,
//         roundness: {
//           type: 3,
//         },
//       },
//       {
//         type: "text",
//         x: position.x + 28,
//         y: position.y + 28,
//         text: "✦ Generating with AI",
//         fontSize: 22,
//         strokeColor: "#6d28d9",
//       },
//       {
//         type: "text",
//         x: position.x + 28,
//         y: position.y + 65,
//         text: "Preparing your diagram...",
//         fontSize: 15,
//         strokeColor: "#6b7280",
//       },
//     ]);

//     const currentElements = excalidrawApi.getSceneElements();

//     excalidrawApi.updateScene({
//       elements: [...currentElements, ...placeholderElements],
//     });

//     excalidrawApi.scrollToContent(placeholderElements, {
//       fitToContent: true,
//     });

//     return { position, placeholderIds: placeholderElements.map((e) => e.id) };
//   };

//   const removeAiPlaceholder = (placeholderIds: string[]) => {
//     if (!excalidrawApi) return;

//     const remaining = excalidrawApi
//       .getSceneElements()
//       .filter((element: any) => !placeholderIds.includes(element.id));

//     excalidrawApi.updateScene({ elements: remaining });
//   };

//   /* ----------------------------------------------------------------
//      Generate
//      ---------------------------------------------------------------- */

//   const handleGenerate = async () => {
//     if (!canGenerate) return;

//     setIsGenerating(true);

//     const placeholder = await addAiPlaceholder();

//     try {
//       await onGenerate?.(activeTool.id, prompt.trim());
//       setPrompt("");
//     } finally {
//       if (placeholder) {
//         removeAiPlaceholder(placeholder.placeholderIds);
//       }
//       setIsGenerating(false);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
//       e.preventDefault();
//       handleGenerate();
//     }
//   };

//   return (
//     <div
//       role="dialog"
//       aria-label="AI helper"
//       className="absolute bottom-24 right-6 z-50 flex max-h-155 w-95
//                  flex-col overflow-hidden rounded-2xl border border-gray-200
//                  bg-white shadow-2xl shadow-gray-900/10"
//     >
//       {/* Header */}
//       <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-5">
//         <div>
//           <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
//             <Sparkles size={17} className="text-violet-600" />
//             AI helper
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             Describe it, and it lands on your canvas.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onClose}
//           aria-label="Close AI helper"
//           className="-mr-1 -mt-1 rounded-lg p-1.5 text-gray-400
//                      transition hover:bg-gray-100 hover:text-gray-600
//                      focus-visible:outline-2 focus-visible:outline-offset-2
//                      focus-visible:outline-violet-500"
//         >
//           <X size={16} />
//         </button>
//       </header>

//       {/* Tool selector */}
//       <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
//         <div className="flex flex-col gap-1">
//           {AI_TOOLS.map((tool) => {
//             const Icon = tool.icon;
//             const isActive = tool.id === activeTool.id;

//             return (
//               <button
//                 key={tool.id}
//                 type="button"
//                 aria-pressed={isActive}
//                 disabled={isGenerating}
//                 onClick={() => setActiveTool(tool)}
//                 className={`flex items-center gap-3 rounded-xl border px-2.5 py-2 text-left
//                             transition disabled:opacity-50 focus-visible:outline-2
//                             focus-visible:outline-offset-2 focus-visible:outline-violet-500
//                   ${
//                     isActive
//                       ? tool.selected
//                       : "border-transparent hover:bg-gray-50"
//                   }`}
//               >
//                 <span
//                   className={`flex h-9 w-9 shrink-0 items-center justify-center
//                               rounded-lg ${tool.tint} ${tool.accent}`}
//                 >
//                   <Icon size={17} />
//                 </span>

//                 <span className="min-w-0">
//                   <span className="block truncate text-sm font-medium text-gray-900">
//                     {tool.name}
//                   </span>
//                   <span className="block truncate text-xs text-gray-500">
//                     {tool.desc}
//                   </span>
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Prompt */}
//       <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 p-4">
//         <Textarea
//           value={prompt}
//           maxLength={MAX_PROMPT}
//           disabled={isGenerating}
//           onChange={(e) => setPrompt(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder={activeTool.placeholder}
//           className="min-h-21 resize-none border-gray-200 bg-white text-sm
//                      placeholder:text-gray-400 focus-visible:ring-violet-500/30"
//         />

//         <div className="mt-3 flex items-center justify-between gap-3">
//           <span className="text-xs tabular-nums text-gray-400">
//             {prompt.length}/{MAX_PROMPT}
//           </span>

//           <Button
//             onClick={handleGenerate}
//             disabled={!canGenerate}
//             className="flex items-center gap-2"
//           >
//             {isGenerating ? (
//               <>
//                 <Loader2 size={15} className="animate-spin" />
//                 Generating
//               </>
//             ) : (
//               <>
//                 <Sparkles size={15} />
//                 Generate
//                 <CornerDownLeft size={13} className="opacity-50" />
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AIFloatingSidebar;



"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  CornerDownLeft,
  Loader2,
  Monitor,
  Network,
  PencilRuler,
  Smartphone,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  onClose?: () => void;
};

const AI_TOOLS = [
  {
    id: "diagram",
    name: "Diagram",
    desc: "Boxes and connections from a description",
    icon: PencilRuler,
    accent: "text-blue-600",
    tint: "bg-blue-50",
    selected: "border-blue-200 bg-blue-50/70",
    placeholder:
      "Eg. Client sends a request to the API, which reads from a cache before hitting the database",
    prompt:
      "Generate a clear labelled diagram. Use rectangles for entities and arrows for relationships. Keep labels short.",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    desc: "Steps and decision points in order",
    icon: Workflow,
    accent: "text-violet-600",
    tint: "bg-violet-50",
    selected: "border-violet-200 bg-violet-50/70",
    placeholder:
      "Eg. Customer onboarding, branching on whether their email is already registered",
    prompt:
      "Generate a top-to-bottom flowchart. Use rectangles for steps, diamonds for decisions, and label every branch arrow with its condition.",
  },
  {
    id: "architecture",
    name: "Architecture",
    desc: "Services, storage, and how they connect",
    icon: Network,
    accent: "text-orange-600",
    tint: "bg-orange-50",
    selected: "border-orange-200 bg-orange-50/70",
    placeholder:
      "Eg. Next.js frontend, Postgres, a queue worker, and an S3 bucket for uploads",
    prompt:
      "Generate a system architecture diagram. Group related services, show data stores distinctly, and label the arrows with the protocol or data passed.",
  },
  {
    id: "web-mockup",
    name: "Web mockup",
    desc: "Page layout and wireframe blocks",
    icon: Monitor,
    accent: "text-cyan-600",
    tint: "bg-cyan-50",
    selected: "border-cyan-200 bg-cyan-50/70",
    placeholder:
      "Eg. Pricing page with three plan columns and a comparison table underneath",
    prompt:
      "Generate a desktop web wireframe. Use plain rectangles for layout blocks and short text labels. No decoration or colour beyond greys.",
  },
  {
    id: "mobile-mockup",
    name: "Mobile mockup",
    desc: "App screens and navigation",
    icon: Smartphone,
    accent: "text-pink-600",
    tint: "bg-pink-50",
    selected: "border-pink-200 bg-pink-50/70",
    placeholder:
      "Eg. Sign-up flow across three screens, ending on a home feed with a tab bar",
    prompt:
      "Generate mobile app wireframes as tall narrow phone frames placed side by side. Show navigation between screens with arrows.",
  },
];

const MAX_PROMPT = 400;

function AIFloatingSidebar({ excalidrawApi, onClose }: Props) {
  const [activeTool, setActiveTool] = useState(AI_TOOLS[0]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = userInput.trim().length > 0 && !loading;

  /* ----------------------------------------------------------------
     Find an empty spot on the canvas for the new content
     ---------------------------------------------------------------- */

  const getEmptyCanvasPosition = () => {
    if (!excalidrawApi) {
      return { x: 100, y: 100 };
    }

    const elements = excalidrawApi
      .getSceneElements()
      .filter((element: any) => !element.isDeleted);

    if (elements.length === 0) {
      return { x: 100, y: 100 };
    }

    // Find right-most element
    const maxRight = Math.max(
      ...elements.map((element: any) => element.x + element.width)
    );
    const minTop = Math.min(...elements.map((element: any) => element.y));

    return {
      x: maxRight + 150,
      y: minTop,
    };
  };

  /* ----------------------------------------------------------------
     Placeholder card shown while the AI is working
     ---------------------------------------------------------------- */

  const addAiPlaceholder = async () => {
    if (!excalidrawApi) return null;

    const { convertToExcalidrawElements } = await import(
      "@excalidraw/excalidraw"
    );

    const position = getEmptyCanvasPosition();

    const placeholderElements = convertToExcalidrawElements([
      {
        type: "rectangle",
        customData: { aiPlaceholder: true },
        x: position.x,
        y: position.y,
        width: 420,
        height: 250,
        backgroundColor: "#f5f3ff",
        strokeColor: "#8b5cf6",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        type: "text",
        customData: { aiPlaceholder: true },
        x: position.x + 28,
        y: position.y + 28,
        text: "✦ Generating with AI",
        fontSize: 22,
        strokeColor: "#6d28d9",
      },
      {
        type: "text",
        customData: { aiPlaceholder: true },
        x: position.x + 28,
        y: position.y + 65,
        text: "Preparing your diagram...",
        fontSize: 15,
        strokeColor: "#6b7280",
      },
      {
        type: "rectangle",
        customData: { aiPlaceholder: true },
        x: position.x + 28,
        y: position.y + 115,
        width: 250,
        height: 18,
        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",
        fillStyle: "solid",
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        type: "rectangle",
        customData: { aiPlaceholder: true },
        x: position.x + 28,
        y: position.y + 150,
        width: 330,
        height: 18,
        backgroundColor: "#ede9fe",
        strokeColor: "#ede9fe",
        fillStyle: "solid",
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        type: "rectangle",
        customData: { aiPlaceholder: true },
        x: position.x + 28,
        y: position.y + 185,
        width: 190,
        height: 18,
        backgroundColor: "#ddd6fe",
        strokeColor: "#ddd6fe",
        fillStyle: "solid",
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
    ]);

    const currentElements = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
      elements: [...currentElements, ...placeholderElements],
    });

    excalidrawApi.scrollToContent(placeholderElements, {
      fitToContent: true,
    });

    return position;
  };

  const removeAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const updatedElements = excalidrawApi
      .getSceneElements()
      .filter((element: any) => !element.customData?.aiPlaceholder);

    excalidrawApi.updateScene({ elements: updatedElements });
  };

  /* ----------------------------------------------------------------
     Generate
     ---------------------------------------------------------------- */

  const onClickGenerate = async () => {
    if (!canGenerate || !excalidrawApi) return;

    setLoading(true);
    setError(null);

    const position = (await addAiPlaceholder()) ?? { x: 100, y: 100 };

    try {
      const result = await axios.post("/api/ai", {
        userInput: userInput.trim(),
        type: activeTool.name,
        systemPrompt: activeTool.prompt,
      });

      const { convertToExcalidrawElements } = await import(
        "@excalidraw/excalidraw"
      );

      // Offset the AI's 0,0-based layout to the empty spot we found.
      // Arrows and lines derive their geometry from the shapes they bind
      // to, so shifting their x/y desyncs them from their points.
      const positioned = result.data.elements.map((element: any) => {
        if (element.type === "arrow" || element.type === "line") {
          const { x, y, ...rest } = element;
          return rest;
        }

        return {
          ...element,
          x: (element.x ?? 0) + position.x,
          y: (element.y ?? 0) + position.y,
        };
      });

      const generated = convertToExcalidrawElements(positioned);

      const current = excalidrawApi
        .getSceneElements()
        .filter((element: any) => !element.customData?.aiPlaceholder);

      excalidrawApi.updateScene({
        elements: [...current, ...generated],
      });

      excalidrawApi.scrollToContent(generated, { fitToContent: true });

      setUserInput("");
    } catch (err: any) {
      console.error(err);

      removeAiPlaceholder();

      setError(err?.response?.data?.error ?? "Generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onClickGenerate();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="AI helper"
      className="absolute bottom-24 right-6 z-50 flex max-h-155 w-95
                 flex-col overflow-hidden rounded-2xl border border-gray-200
                 bg-white shadow-2xl shadow-gray-900/10"
    >
      {/* Header */}
      <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Sparkles size={17} className="text-violet-600" />
            AI helper
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Describe it, and it lands on your canvas.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI helper"
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-gray-400
                     transition hover:bg-gray-100 hover:text-gray-600
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-violet-500"
        >
          <X size={16} />
        </button>
      </header>

      {/* Tool selector */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        <div className="flex flex-col gap-1">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeTool.id;

            return (
              <button
                key={tool.id}
                type="button"
                aria-pressed={isActive}
                disabled={loading}
                onClick={() => setActiveTool(tool)}
                className={`flex items-center gap-3 rounded-xl border px-2.5 py-2 text-left
                            transition disabled:opacity-50 focus-visible:outline-2
                            focus-visible:outline-offset-2 focus-visible:outline-violet-500
                  ${
                    isActive
                      ? tool.selected
                      : "border-transparent hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center
                              rounded-lg ${tool.tint} ${tool.accent}`}
                >
                  <Icon size={17} />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {tool.name}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {tool.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 p-4">
        <Textarea
          value={userInput}
          maxLength={MAX_PROMPT}
          disabled={loading}
          onChange={(event) => setUserInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeTool.placeholder}
          className="min-h-21 resize-none border-gray-200 bg-white text-sm
                     placeholder:text-gray-400 focus-visible:ring-violet-500/30"
        />

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-gray-400">
            {userInput.length}/{MAX_PROMPT}
          </span>

          <Button
            onClick={onClickGenerate}
            disabled={!canGenerate}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate
                <CornerDownLeft size={13} className="opacity-50" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AIFloatingSidebar;