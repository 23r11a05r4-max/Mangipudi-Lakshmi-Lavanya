
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationStatus } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface VerificationResult {
  verdict: 'REAL' | 'FAKE' | 'DILEMMA';
  confidence: number;
  reasoning: string;
  isAiGenerated: boolean;
}

export const verifyNews = async (
  newsText: string,
  base64Image?: string,
  mimeType?: string
): Promise<VerificationResult> => {
  try {
    const textPart = {
      text: `Analyze the following news report for authenticity. Consider the language used, potential biases, and compare it with known facts. Also analyze the provided image for signs of AI generation or manipulation.
      
      News Text: "${newsText}"
      
      Based on all available information, provide your analysis in the requested JSON format.`
    };
    
    const parts: any[] = [textPart];

    if (base64Image && mimeType) {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        parts.splice(1, 0, imagePart);
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: parts }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    verdict: {
                        type: Type.STRING,
                        description: "Your final verdict. Must be one of: 'REAL', 'FAKE', or 'DILEMMA'."
                    },
                    confidence: {
                        type: Type.NUMBER,
                        description: "Your confidence in the verdict, from 0 to 100."
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: "A brief, neutral explanation for your verdict, citing specific elements from the text or image."
                    },
                    isAiGenerated: {
                        type: Type.BOOLEAN,
                        description: "True if you believe the image is AI-generated, false otherwise. If no image is provided, return false."
                    }
                },
                required: ["verdict", "confidence", "reasoning", "isAiGenerated"]
            },
        },
    });

    const jsonText = response.text.trim();
    const result: VerificationResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error verifying news with Gemini API:", error);
    // Return a default error state
    return {
      verdict: 'DILEMMA',
      confidence: 0,
      reasoning: 'An error occurred during AI analysis. Unable to verify.',
      isAiGenerated: false,
    };
  }
};
