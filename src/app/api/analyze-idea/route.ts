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
    const { ideaId, title, description, type, targetUsers, techStackPref, aiTools } = await request.json();

    if (!ideaId || !title || !description || !type || !targetUsers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Enhanced OpenAI prompt
    const openai = getOpenAI();
    const prompt = `You are an expert full-stack developer and AI project architect. Your job is to take raw app ideas and convert them into structured development blueprints for real-world implementation.\n\nGiven this app idea:\n- Title: ${title}\n- Description: ${description}\n- Type: ${type}\n- Target Users: ${targetUsers}\n- Tech Stack Preferences: ${techStackPref || "None"}\n- AI Tools Used: ${aiTools || "None"}\n\nAnalyze and output the following as JSON:\n\n1. summary: A clear 1–2 sentence explanation of the app’s goal\n2. mvpScope: A concise bullet list of the minimum viable product features\n3. techStack: A detailed list of recommended technologies (frontend, backend, database, auth, AI, hosting)\n4. userFlow: A list of main screens/pages and their purpose\n5. databaseSchema: A suggested Firebase schema (collections and key fields)\n6. aiUsage: How AI can be used in this project\n7. githubInspiration: List of 2-5 relevant public GitHub repos or projects\n8. apis: Helpful third-party APIs, SDKs, or libraries to integrate\n9. roadmap: A linear, step-by-step list of development tasks from setup to launch\n\nFormat the response strictly as JSON using this structure:\n{\n  "summary": "App summary",\n  "mvpScope": ["Feature 1", "Feature 2"],\n  "techStack": ["Frontend", "Backend", "Database", "Auth", "AI", "Hosting"],\n  "userFlow": ["Screen 1", "Screen 2"],\n  "databaseSchema": { "collection1": ["field1", "field2"], ... },\n  "aiUsage": "How AI is used",\n  "githubInspiration": ["repo1", "repo2"],\n  "apis": ["API 1", "API 2"],\n  "roadmap": ["Step 1", "Step 2"]\n}\nMake sure to keep values relevant to the app description and user preferences.`;

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
