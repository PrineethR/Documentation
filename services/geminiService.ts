import { GoogleGenAI, Type } from "@google/genai";
import { BlockType } from "../types";

// Initialize the client
// NOTE: Process.env.API_KEY is assumed to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';

export interface AIAnalysisResult {
  title: string;
  summary: string;
  tags: string[];
}

export const analyzeContent = async (content: string, type: BlockType): Promise<AIAnalysisResult> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Skipping AI analysis.");
    return { title: 'Untitled', summary: '', tags: [] };
  }

  const prompt = `
    You are a meticulous archivist for a digital library.
    Analyze the following content (which is a ${type}).
    
    1. Provide a concise Title (max 6 words).
    2. Provide a 1-sentence summary or description.
    3. Generate 3-5 relevant, single-word lowercase tags.
    
    Content:
    ${content.substring(0, 5000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      title: 'New Block',
      summary: 'Analysis failed.',
      tags: ['uncategorized']
    };
  }
};

export const findConnections = async (query: string, contextBlocks: string[]): Promise<string> => {
   if (!process.env.API_KEY) return "AI Key missing.";

   const context = contextBlocks.join('\n---\n');
   
   const prompt = `
     Here is a collection of notes and references (The Stash):
     ${context}
     
     Based on this stash, answer the following question or explore the connection:
     "${query}"
     
     Keep it brief, insightful, and reference specific items if possible.
   `;

   try {
     const response = await ai.models.generateContent({
       model: MODEL_NAME,
       contents: prompt,
     });
     return response.text || "No insights found.";
   } catch (e) {
     return "Error generating connections.";
   }
}