import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage } from '../types';
import type { Content } from '@google/genai';


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    customerName: { type: Type.STRING, description: "The full name of the customer or recipient." },
    items: {
      type: Type.ARRAY,
      description: "A list of items or services being billed.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Description of the item or service." },
          quantity: { type: Type.NUMBER, description: "The quantity of the item." },
          unitPrice: { type: Type.NUMBER, description: "The price per unit of the item." },
        },
        required: ["description", "quantity", "unitPrice"],
      },
    },
    dueDate: { type: Type.STRING, description: "For one-off invoices, the date it's due, in YYYY-MM-DD format. Infer from the prompt if possible (e.g. 'next Friday')." },
    notes: { type: Type.STRING, description: "Any additional notes for the customer." },
    paymentMethod: { type: Type.STRING, description: "The requested payment method, if specified (e.g., 'PayPal', 'Venmo', 'Cash App'). Should be one of the connected accounts." },
    isRecurring: { type: Type.BOOLEAN, description: "Set to true if the user requests a recurring, repeating, or subscription-based invoice." },
    recurrenceFrequency: { type: Type.STRING, description: "If isRecurring is true, specify the frequency. Valid values are 'daily', 'weekly', 'monthly', 'yearly'.", enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    startDate: { type: Type.STRING, description: "If isRecurring is true, specify the start date for the first invoice in YYYY-MM-DD format." },
  },
  required: ["customerName", "items"],
};

const propertySchema = {
    type: Type.OBJECT,
    properties: {
        address: { type: Type.STRING, description: "A realistic-sounding, but completely fictional, US street address for the property." },
        price: { type: Type.NUMBER, description: "The listing price of the property." },
        beds: { type: Type.INTEGER, description: "The number of bedrooms." },
        baths: { type: Type.NUMBER, description: "The number of bathrooms (can be a decimal, e.g., 2.5)." },
        sqft: { type: Type.INTEGER, description: "The total square footage of the property." },
        type: { type: Type.STRING, description: "The type of investment opportunity.", enum: ['Foreclosure', 'Rental Prospect', 'Below Market', 'Fixer-upper'] },
        analysis: { type: Type.STRING, description: "A brief, one or two-sentence analysis of the property's investment potential from the perspective of a real estate expert." },
    },
    required: ["address", "price", "beds", "baths", "sqft", "type", "analysis"],
};


const SYSTEM_INSTRUCTION = `You are PayPilot, an expert AI assistant specializing in creating and managing invoices. Your primary function is to understand user requests for creating invoices and extract the necessary information into a structured JSON format.

When the user asks to create an invoice, bill, or receipt, analyze their request for the following details:
- Customer's Name
- A list of line items, including their description, quantity, and unit price.
- A due date (for one-off invoices).
- Any additional notes.
- A specific payment method (e.g., PayPal, Venmo).
- **Recurring Details**: Check if the request is for a recurring (e.g., "monthly", "weekly", "subscription") invoice. If so, set 'isRecurring' to true, and populate 'recurrenceFrequency' and 'startDate'.

Your response MUST be a single JSON object that conforms to the provided schema. Do not include any text, pleasantries, or markdown formatting before or after the JSON object.

If the user's request is conversational and not related to creating an invoice (e.g., asking for help, greeting you), you may respond with a friendly, concise natural language message. Do not attempt to create a JSON invoice for ambiguous requests.

**Example 1: One-off Invoice**
Request: "Send a PayPal invoice to Smith Corp for 10 hours of consulting at $150/hr, due next Friday."
JSON Response (without markdown):
{
  "customerName": "Smith Corp",
  "items": [{ "description": "Consulting services", "quantity": 10, "unitPrice": 150 }],
  "dueDate": "2023-10-27"
}

**Example 2: Recurring Invoice**
Request: "Set up a monthly invoice for Tech Solutions for their $2000 retainer, starting September 1st."
JSON Response (without markdown):
{
  "customerName": "Tech Solutions",
  "items": [{ "description": "Monthly Retainer", "quantity": 1, "unitPrice": 2000 }],
  "isRecurring": true,
  "recurrenceFrequency": "monthly",
  "startDate": "2023-09-01"
}
`;


export const getAssistance = async (prompt: string, imageBase64: string | null = null): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const parts: any[] = [{ text: prompt }];

    if (imageBase64) {
      parts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        return `Error calling AI model: ${error.message}`;
    }
    return "An unexpected error occurred while contacting the AI model.";
  }
};

const roleMap: { [key in ChatMessage['role']]: 'user' | 'model' } = {
  user: 'user',
  bot: 'model',
};

export const getConversationalAssistance = async (
  history: ChatMessage[],
  newPrompt: string, 
  imageBase64: string | null = null,
  connectedAccounts: string[] = []
): Promise<string> => {
   try {
    const model = 'gemini-2.5-flash';

    const contents: Content[] = history.map(msg => ({
        role: roleMap[msg.role],
        parts: [{ text: msg.content }],
    }));

    const userParts: any[] = [{ text: newPrompt }];
    if (imageBase64) {
      userParts.unshift({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
    }
    contents.push({ role: 'user', parts: userParts });

    let dynamicSystemInstruction = SYSTEM_INSTRUCTION;
    if (connectedAccounts.length > 0) {
        dynamicSystemInstruction += `\n\nThe user has connected the following payment accounts: ${connectedAccounts.join(', ')}. When a payment method is requested, you MUST use one of these. If no method is specified, you can leave the field blank.`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: invoiceSchema,
      }
    });
    
    // Although we ask for JSON, the model can sometimes fail and return text.
    // The .text property safely provides the full response string.
    return response.text;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Try a simpler text-based call as a fallback
    try {
        console.log("Falling back to simple text generation...");
        return await getAssistance(`As an AI assistant, my previous attempt to generate structured data failed. Please answer this user's request in a conversational way: "${newPrompt}"`);
    } catch (fallbackError) {
        console.error("Fallback Gemini API call also failed:", fallbackError);
        throw error;
    }
  }
}

export const generatePropertyListing = async (): Promise<string> => {
    const propertySystemInstruction = `You are a real estate analysis AI. Your task is to generate a single, fictional but realistic-sounding property listing that represents a good investment opportunity. The property should be located in the United States. Your response MUST be a single JSON object conforming to the provided schema. Do not include any text or markdown formatting before or after the JSON. Randomly choose one of the 'type' enums for each generation.`;

    try {
        const model = 'gemini-2.5-flash';
        const response = await ai.models.generateContent({
            model: model,
            contents: "Generate a new, fictional property investment listing.",
            config: {
                systemInstruction: propertySystemInstruction,
                responseMimeType: "application/json",
                responseSchema: propertySchema,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API call for property generation failed:", error);
        throw error;
    }
};