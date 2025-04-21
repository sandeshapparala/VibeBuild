/* eslint-disable */


import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase-admin";
import { getOpenAI } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    // Get authorization token
    const authHeader = request.headers.get("authorization");
    console.log("sandesh", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get the idea information
    const { ideaId, title, description } = await request.json();
    
    if (!ideaId || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Initialize OpenAI
    // Initialize OpenAI
const openai = getOpenAI();

// Create the enhanced prompt for GPT
const prompt = `You are an expert full-stack developer and AI project architect. Your job is to take raw app ideas and convert them into structured development blueprints for real-world implementation.

Given this app idea: "${title}: ${description}"

Analyze and output the following:

1. summary: A clear 1–2 sentence explanation of the app’s goal  
2. techStack: A detailed list of technologies including:
   - Frontend framework
   - Backend platform
   - Database
   - Authentication method
   - AI tools or APIs
   - Hosting/deployment
3. modules: Core features or app modules
4. apis: Helpful third-party APIs, SDKs, or libraries to integrate
5. steps: A linear list of development phases, from setup to launch

Format the response strictly as JSON using this structure:

{
  "summary": "App summary",
  "techStack": ["Frontend", "Backend", "Database", "Auth", "AI", "Hosting"],
  "modules": ["Module 1", "Module 2", "Module 3"],
  "apis": ["API 1", "API 2", "API 3"],
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
}
Make sure to keep values relevant to the app description.`;

// Call OpenAI API
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content:
        "You are a helpful assistant skilled in full-stack software planning, AI project design, and technical architecture. Generate structured, JSON-formatted development plans with practical implementation steps.",
    },
    {
      role: "user",
      content: prompt,
    },
  ],
  response_format: { type: "json_object" },
});


    
    // Parse the response
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }
    
    // Parse the JSON response
    const gptOutput = JSON.parse(responseContent);
    
    // Update the Firestore document with the GPT output
    await db.collection("users").doc(userId).collection("ideas").doc(ideaId).update({
      gptOutput
    });
    
    return NextResponse.json({ success: true, ideaId });
  } catch (error: any) {
    console.error("Error analyzing idea:", error);
    return NextResponse.json({ error: error.message || "Error analyzing idea" }, { status: 500 });
  }
}
