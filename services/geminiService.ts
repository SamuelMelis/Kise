import { GoogleGenAI, Type } from "@google/genai";
import { Asset } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getPortfolioInsight = async (
  assets: Asset[],
  goal: number,
  totalValue: number
): Promise<{ insight: string; tip: string }> => {
  if (!apiKey) {
    return {
      insight: "API Key missing. Add your Gemini API key to unlock AI insights.",
      tip: "Configure environment variables."
    };
  }

  const prompt = `
    Analyze this asset portfolio.
    Total Value: $${totalValue}
    Goal: $${goal}
    Assets: ${JSON.stringify(assets.map(a => ({ name: a.name, value: a.value, category: a.category })))}

    Provide a short, encouraging 2-sentence summary of their progress and diversity ("insight").
    Then provide 1 specific, actionable, short financial tip ("tip") based on what they have or are missing.
    Be witty but professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            tip: { type: Type.STRING },
          },
          required: ["insight", "tip"]
        }
      }
    });

    const text = response.text;
    if (!text) return { insight: "Could not generate insight.", tip: "Try again later." };
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      insight: "I'm having trouble analyzing your charts right now.",
      tip: "Keep saving while I reconnect."
    };
  }
};

export const suggestCategory = async (assetName: string): Promise<string> => {
  if (!apiKey) return "Uncategorized";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Categorize the asset "${assetName}" into one of these single words: Cash, Stocks, Crypto, RealEstate, Vehicle, Electronics, Collectibles, Savings, or Other. Return ONLY the word.`,
    });
    return response.text?.trim() || "Other";
  } catch (error) {
    return "Other";
  }
};