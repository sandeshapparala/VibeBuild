"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import IdeaForm from "@/components/forms/IdeaForm";
import IdeaCard from "@/components/idea/IdeaCard";
import { useRouter } from "next/navigation";

export default function IdeaPage() {
  const { user, loading } = useAuth();
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
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
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [loading, user, router]);

  const handleIdeaSubmitted = (ideaId: string) => {
    setActiveIdeaId(ideaId);
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {!showResults ? (
        <div className="container mx-auto px-4 py-8">
          <IdeaForm onIdeaSubmitted={handleIdeaSubmitted} authToken={authToken} />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <button 
            onClick={() => setShowResults(false)}
            className="mb-8 text-blue-400 hover:text-blue-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to idea submission
          </button>
          {activeIdeaId && <IdeaCard ideaId={activeIdeaId} />}
        </div>
      )}
    </div>
  );
}
