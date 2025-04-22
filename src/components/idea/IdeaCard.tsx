"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {doc, getDoc, Timestamp} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import RoadmapEditor from "./RoadmapEditor";

interface GPTOutput {
  summary: string;
  mvpScope?: string[];
  techStack: string[];
  userFlow?: string[];
  databaseSchema?: Record<string, string[]>;
  aiUsage?: string;
  githubInspiration?: string[];
  apis: string[];
  roadmap?: string[];
  modules?: string[];
  steps?: string[];
  coreModules?: string[];
}

interface IdeaData {
  title: string;
  description: string;
  createdAt: Timestamp;
  gptOutput: GPTOutput | null;
}

export default function IdeaCard({ ideaId }: { ideaId: string }) {
  const { user } = useAuth();
  const [idea, setIdea] = useState<IdeaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIdea = async () => {
      if (!user || !ideaId) return;

      try {
        setLoading(true);
        const ideaRef = doc(db, "users", user.uid, "ideas", ideaId);
        const ideaSnap = await getDoc(ideaRef);

        if (ideaSnap.exists()) {
          setIdea(ideaSnap.data() as IdeaData);
        } else {
          setError("Idea not found");
        }
      } catch (err) {
        console.error("Error fetching idea:", err);
        setError("Failed to load idea");
      } finally {
        setLoading(false);
      }
    };

    fetchIdea();
  }, [user, ideaId]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent className="py-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !idea) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent className="py-4">
          <div className="text-red-500 text-center py-8">{error || "Failed to load idea"}</div>
        </CardContent>
      </Card>
    );
  }

  // Idea is still being analyzed
  if (!idea.gptOutput) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>{idea.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Analyzing your idea with AI...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{idea.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">{idea.gptOutput.summary}</p>
        </div>

        {idea.gptOutput.mvpScope && (
          <div>
            <h3 className="text-lg font-medium mb-2">MVP Scope</h3>
            <ul className="list-disc pl-5 space-y-1">
              {idea.gptOutput.mvpScope.map((item, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(idea.gptOutput.techStack) && idea.gptOutput.techStack.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Recommended Tech Stack</h3>
            <ul className="list-disc pl-5 space-y-1">
              {idea.gptOutput.techStack.map((tech, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">{tech}</li>
              ))}
            </ul>
          </div>
        )}

        {idea.gptOutput.userFlow && (
          <div>
            <h3 className="text-lg font-medium mb-2">User Flow (Screens/Pages)</h3>
            <ul className="list-disc pl-5 space-y-1">
              {idea.gptOutput.userFlow.map((screen, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">{screen}</li>
              ))}
            </ul>
          </div>
        )}

        {idea.gptOutput.databaseSchema && (
          <div>
            <h3 className="text-lg font-medium mb-2">Suggested Firebase Database Schema</h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 text-sm overflow-x-auto">
              <pre>{JSON.stringify(idea.gptOutput.databaseSchema, null, 2)}</pre>
            </div>
          </div>
        )}

        {idea.gptOutput.aiUsage && (
          <div>
            <h3 className="text-lg font-medium mb-2">Suggested AI Usage</h3>
            <p className="text-gray-700 dark:text-gray-300">{idea.gptOutput.aiUsage}</p>
          </div>
        )}

        {idea.gptOutput.githubInspiration && (
          <div>
            <h3 className="text-lg font-medium mb-2">GitHub Inspiration</h3>
            <ul className="list-disc pl-5 space-y-1">
              {idea.gptOutput.githubInspiration.map((repo, i) => (
                <li key={i} className="text-gray-700 dark:text-gray-300">{repo}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-2">Suggested APIs/Tools</h3>
          <ul className="list-disc pl-5 space-y-1">
            {idea.gptOutput.apis.map((api, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">{api}</li>
            ))}
          </ul>
        </div>

        {idea.gptOutput.roadmap && (
          <div>
            <h3 className="text-lg font-medium mb-2">Project Roadmap</h3>
            <RoadmapEditor ideaId={ideaId} initialRoadmap={idea.gptOutput.roadmap} />
          </div>
        )}

        {/* Fallback for modules/steps if roadmap is not present */}
        {!idea.gptOutput.roadmap && (
          <>
            <div>
              <h3 className="text-lg font-medium mb-2">Key Features/Modules</h3>
              <ul className="list-disc pl-5 space-y-1">
                {(idea.gptOutput.coreModules || idea.gptOutput.modules || []).map((module, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">{module}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Development Steps</h3>
              <ol className="list-decimal pl-5 space-y-1">
                {(idea.gptOutput.steps || []).map((step, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">{step}</li>
                ))}
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
