"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import IdeaForm from "@/components/forms/IdeaForm";
import IdeaCard from "@/components/idea/IdeaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function IdeaPage() {
  const { user, loading } = useAuth();
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  // Get the auth token when the user is available
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      }
    };
    
    getToken();
  }, [user]);

  // Redirect if not logged in
  if (!loading && !user) {
    router.push("/signin");
    return null;
  }

  const handleIdeaSubmitted = (ideaId: string) => {
    setActiveIdeaId(ideaId);
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">App Idea Generator</h1>
      
      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="submit">Submit Idea</TabsTrigger>
          {activeIdeaId && (
            <TabsTrigger value="result">Analysis Result</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="submit">
          <IdeaForm onIdeaSubmitted={handleIdeaSubmitted} authToken={authToken} />
        </TabsContent>
        
        {activeIdeaId && (
          <TabsContent value="result">
            <IdeaCard ideaId={activeIdeaId} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
