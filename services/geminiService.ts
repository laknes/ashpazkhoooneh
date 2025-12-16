
import { GoogleGenAI } from "@google/genai";

// Safely access process.env to prevent runtime crashes in browser environments
const getApiKey = (): string => {
  // Check for Vite injected environment variable first (via define)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
     // @ts-ignore
     return process.env.API_KEY;
  }
  
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  return '';
};

const apiKey = getApiKey();
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const isAiConfigured = (): boolean => {
    return !!apiKey && apiKey.length > 0;
};

export const generateChefResponse = async (query: string): Promise<string> => {
  if (!apiKey) return "لطفاً کلید API را تنظیم کنید.";

  try {
    const ai = getClient();
    const modelId = "gemini-2.5-flash"; // Using appropriate model for chat

    const systemPrompt = `
      شما یک دستیار هوشمند آشپزی و خرید لوازم آشپزخانه برای فروشگاه "آشپزخونه" هستید.
      وظیفه شما راهنمایی مشتریان به زبان فارسی مودبانه و صمیمی است.
      اگر کاربر درباره پخت غذا سوال کرد، دستور پخت کوتاه بدهید.
      اگر درباره لوازم سوال کرد، ویژگی‌های مهم یک وسیله خوب را توضیح دهید.
      کوتاه و مفید پاسخ دهید (حداکثر ۱۰۰ کلمه).
    `;

    const response = await ai.models.generateContent({
        model: modelId,
        contents: query,
        config: {
            systemInstruction: systemPrompt,
        }
    });

    return response.text || "متاسفانه نمی‌توانم پاسخ دهم.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "در حال حاضر ارتباط با هوش مصنوعی برقرار نیست. لطفاً بعداً تلاش کنید.";
  }
};
