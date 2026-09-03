"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

function WelcomeBanner() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /**
   * The AI panel only exists on a canvas, so this opens the most recent board
   * with it already expanded — starting a board first if there aren't any.
   */
  const openAiHelper = async () => {
    setLoading(true);

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
      toast.add({
        title: "Could not open the AI helper",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-10 border rounded-xl bg-linear-to-r from-blue-200 to-purple-200">
        <h2 className="text-2xl font-bold">Welcome Back, {user?.fullName}</h2>
        <p className="mt-2">Bring Your Ideas to Life on infinite canvas</p>

        <div className="flex items-center gap-2 mt-5">
          <Button
            variant="outline"
            size="lg"
            onClick={openAiHelper}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            AI Helper
          </Button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
