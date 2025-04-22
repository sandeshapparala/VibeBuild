/* eslint-disable */

"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

const PROJECT_TYPES = [
  "Web App",
  "Mobile App",
  "API",
  "AI Tool",
  "Chrome Extension",
  "Desktop App",
  "Other"
];

export default function IdeaForm({ onIdeaSubmitted, authToken }: { onIdeaSubmitted: (id: string) => void, authToken: string | null }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  
  // Follow-up questions
  const [targetUsers, setTargetUsers] = useState("");
  const [techStackPref, setTechStackPref] = useState("");
  const [aiTools, setAiTools] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle initial form submission (Step 1 → Step 2)
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setStep(2);
  };

  // Handle final form submission with all data
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !authToken) return;
    
    try {
      setIsSubmitting(true);
      setError("");
      
      // Add the idea to Firestore
      const userIdeasRef = collection(db, "users", user.uid, "ideas");
      const ideaDoc = await addDoc(userIdeasRef, {
        title,
        description,
        type: projectType,
        targetUsers,
        techStackPref,
        aiTools,
        createdAt: serverTimestamp(),
        // gptOutput will be filled by the API
      });
      
      // Call the analysis API
      const response = await fetch("/api/analyze-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ideaId: ideaDoc.id,
          title,
          description,
          type: projectType,
          targetUsers,
          techStackPref,
          aiTools
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze idea");
      }
      
      // Trigger the parent component to show analysis
      onIdeaSubmitted(ideaDoc.id);
      
    } catch (err: any) {
      console.error("Error submitting idea:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
      <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-10">
        {step === 1 ? "What do you want to build?" : "Tell us more about your project"}
      </h1>
      
      {step === 1 ? (
        // STEP 1: Initial idea entry
        <form onSubmit={handleInitialSubmit} className="w-full max-w-3xl">
          <p className="text-gray-400 text-lg text-center mb-8">
            Prompt, run, edit, and deploy full-stack <span className="text-white font-medium">web</span> and <span className="text-white font-medium">mobile</span> apps.
          </p>
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <textarea
              className="w-full bg-transparent px-6 py-5 text-lg text-white placeholder:text-zinc-500 focus:outline-none min-h-[120px]"
              placeholder="How can VibeBuild help you today?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setTitle(e.target.value.split(".")[0]); // Set title to first sentence
              }}
              required
            />
            
            {/* Project Type dropdown (positioned in the corner) */}
            <div className="absolute bottom-3 left-3 flex items-center space-x-2">
              <select
                className="bg-zinc-800 border border-zinc-700 text-sm rounded px-2 py-1 text-zinc-300"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              >
                {PROJECT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="border-t border-zinc-800 p-3 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
              >
                Next
              </button>
            </div>
          </div>
          
          <div className="mt-12">
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {["Landing Page", "E-commerce Store", "Social Network", "Admin Dashboard", "Chat App"].map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setDescription(`Build a ${suggestion.toLowerCase()}`);
                    setTitle(`${suggestion}`);
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-sm transition border border-zinc-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        // STEP 2: Follow-up questions
        <form onSubmit={handleFinalSubmit} className="w-full max-w-3xl space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">App Idea: {title || description.substring(0, 30)+"..."}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Target Users</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Who will use your app? (e.g., freelancers, small businesses, students)"
                  value={targetUsers}
                  onChange={(e) => setTargetUsers(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Tech Stack Preferences (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Any preferred technologies? (e.g., React, Node.js, Firebase)"
                  value={techStackPref}
                  onChange={(e) => setTechStackPref(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">AI Integration (Optional)</label>
                <input
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Any AI features or tools? (e.g., GPT-4, image recognition)"
                  value={aiTools}
                  onChange={(e) => setAiTools(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="text-zinc-400 hover:text-white"
            >
              Back
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                "Generate Blueprint"
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 text-red-500 text-center">
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
