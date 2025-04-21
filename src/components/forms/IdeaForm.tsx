"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface IdeaFormProps {
  onIdeaSubmitted: (ideaId: string) => void;
  authToken: string | null;
}

export default function IdeaForm({ onIdeaSubmitted, authToken }: IdeaFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("You must be logged in to submit an idea");
      }

      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      // First, create the idea document in Firestore
      const userIdeasRef = collection(db, "users", user.uid, "ideas");
      const ideaDocRef = await addDoc(userIdeasRef, {
        title,
        description,
        createdAt: serverTimestamp(),
        status: "pending"
      });

      const ideaId = ideaDocRef.id;

      // Then, send to the analyze-idea API with the auth token
      const response = await fetch("/api/analyze-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          ideaId,
          title,
          description
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze idea");
      }

      // Clear form fields
      setTitle("");
      setDescription("");
      
      // Notify parent component about successful submission
      onIdeaSubmitted(ideaId);


      // @ts-nocheck
      /* eslint-disable */
    } catch (err: any) {
      console.error("Error submitting idea:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              App Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Task Manager, Recipe Finder"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              App Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your app idea in detail..."
              rows={6}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Generate Analysis"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
