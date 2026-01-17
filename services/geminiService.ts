
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

// פונקציה לקבלת המופע, מונעת קריסה בטעינה ראשונית אם המשתנה חסר
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key is missing. Check your environment variables.");
    throw new Error("Missing API Key");
  }
  return new GoogleGenAI({ apiKey });
};

export interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string; // Base64 string
  name?: string;
}

export const chatWithGemini = async (
  history: ChatMessage[], 
  newMessage: string, 
  attachments: Attachment[] = []
): Promise<string> => {
  try {
    const ai = getAiClient();
    const lowerMsg = newMessage.toLowerCase();
    
    // 1. זיהוי אם מדובר בבקשה ליצירת תמונה
    const isGenerationRequest = attachments.length === 0 && (
      lowerMsg.includes('צייר') || 
      lowerMsg.includes('צור תמונה') || 
      lowerMsg.includes('תמונה של') ||
      lowerMsg.includes('draw') || 
      lowerMsg.includes('generate image')
    );

    if (isGenerationRequest) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: newMessage }] },
          config: {
            imageConfig: { aspectRatio: "1:1" }
          }
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
        }
        return "מצטער, לא הצלחתי ליצור את התמונה.";
      } catch (imgError) {
        console.error("Image Generation Error:", imgError);
        return "שגיאה ביצירת תמונה.";
      }
    }

    // 2. הגדרת מודל וכלים
    let modelName = "gemini-3-pro-preview";
    const tools: any[] = [];

    const mapsTriggers = [
        'איפה', 'מסעדה', 'טיול', 'נווט', 'מפה', 'מיקום', 'קרוב ל', 
        'מלון', 'בית מלון', 'אוטובוס', 'קו', 'תחנה', 'לו"ז', 'מתי מגיע', 'רכבת', 'תחבורה', 'טיסה', 'טיסות',
        'where', 'map', 'trip', 'route', 'navigate', 'location', 'restaurant', 'store', 'shop', 
        'hotel', 'bus', 'station', 'schedule', 'stop', 'flight', 'plan', 'days'
    ];
    const needsMaps = mapsTriggers.some(trigger => lowerMsg.includes(trigger));

    if (needsMaps) {
        // עבור תכנון טיולים מורכב, המודל הזה טוב יותר עם כלים
        modelName = "gemini-2.5-flash";
        tools.push({ googleMaps: {} });
    } else {
        tools.push({ googleSearch: {} });
    }

    const contentParts: any[] = [];
    contentParts.push({ text: newMessage });

    if (attachments.length > 0) {
        attachments.forEach(att => {
            const base64Data = att.data.split(',')[1] || att.data;
            contentParts.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: base64Data
                }
            });
        });
    }

    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: `You are Aivan, a smart travel and lifestyle assistant.

        CRITICAL RULES FOR TRIP PLANNING & CARDS:
        1. If the user asks for a **Trip Plan** (e.g., "5 days in London"):
           - Start with a short enthusiastic text summary of the plan.
           - Then, generate a **Rich JSON Block** containing the key components of the trip.
           - The JSON must include:
             1. The **Flight** to the destination.
             2. A recommended **Hotel**.
             3. Key **Attractions** for each day (or main highlights).
             4. A recommended **Restaurant**.

        2. JSON Structure (Must be inside \`:::PLACES_DATA:::\` and \`:::END_PLACES_DATA:::\`):
           \`[ { "type": "CATEGORY", "title": "Name or Day X: Activity", "uri": "Map Link", "description": "Short explanation", "details": ["Detail 1"] } ]\`

        3. CATEGORIES & TYPES (Strict Mapping):
           - **flight**: For flights (Background: Light Blue/Sky).
           - **hotel**: For accommodation (Background: Gold).
           - **restaurant**: For food/dining (Background: Red).
           - **nature**: For parks, hiking, outdoor views (Background: Green).
           - **attraction**: For museums, theme parks, landmarks (Background: Orange).
           - **shopping**: For malls, markets (Background: Pink).
           - **transport**: For buses/trains (Background: Yellow).

        4. CONTENT GUIDELINES:
           - In the 'title', if it's a trip plan, you can write "יום 1: מגדל אייפל" (Day 1: Eiffel Tower).
           - in the 'description' field, write a short persuasive explanation (e.g., "The most famous iron tower in Paris, great views.").
           - Always try to find real locations using the googleMaps tool.

        General:
           - Language: Hebrew.
           - Keep the text outside the JSON concise.
        `,
        tools: tools.length > 0 ? tools : undefined
      },
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    });

    const response = await chat.sendMessage({ 
        message: contentParts 
    });
    
    let finalText = response.text || "מצטער, לא הצלחתי לעבד את התשובה.";

    // Fallback logic if JSON is missing but we have grounding (Maps data)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && groundingChunks.length > 0) {
        if (!finalText.includes(':::PLACES_DATA:::')) {
            const places: any[] = [];
            const uniqueLinks = new Set<string>();

            groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri && !uniqueLinks.has(chunk.web.uri)) {
                    uniqueLinks.add(chunk.web.uri);
                    
                    const title = chunk.web.title || 'מיקום במפה';
                    let type = 'other';
                    
                    // סיווג אוטומטי לפי מילות מפתח
                    if (title.includes('מלון') || title.includes('Hotel')) type = 'hotel';
                    else if (title.includes('מסעדה') || title.includes('Restaurant') || title.includes('פיצה') || title.includes('קפה')) type = 'restaurant';
                    else if (title.includes('נמל תעופה') || title.includes('Airport') || title.includes('טיסה')) type = 'flight';
                    else if (title.includes('קו') || title.includes('תחנה') || title.includes('Bus') || title.includes('רכבת')) type = 'transport';
                    else if (title.includes('פארק') || title.includes('שמורה') || title.includes('גן') || title.includes('הר')) type = 'nature';
                    else if (title.includes('קניון') || title.includes('שוק') || title.includes('חנות')) type = 'shopping';
                    else if (title.includes('מוזיאון') || title.includes('לונה פארק') || title.includes('אטרקציה')) type = 'attraction';
                    
                    places.push({
                        type: type,
                        title: title,
                        uri: chunk.web.uri,
                        description: 'לחץ לפרטים נוספים ומסלול הגעה',
                        details: ['ניווט', 'ביקורות']
                    });
                }
            });

            if (places.length > 0) {
                // הצג עד 3 כרטיסיות בלבד
                const limitedPlaces = places.slice(0, 3);
                finalText += `\n:::PLACES_DATA:::${JSON.stringify(limitedPlaces)}:::END_PLACES_DATA:::`;
            }
        }
    }

    return finalText;
    
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "שגיאה בחיבור ל-Gemini. אנא נסה שוב.";
  }
};

export const generateInitialEmails = async () => [];

export const generateReplySuggestion = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "";
  }
};
