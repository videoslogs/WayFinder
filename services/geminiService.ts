
import { GoogleGenAI, Type } from "@google/genai";
import { RouteData, TravelMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRouteSuggestions = async (from: string, to: string): Promise<RouteData> => {
  const model = "gemini-2.5-flash";
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const prompt = `
    Generate realistic travel options for a trip from "${from}" to "${to}".
    CURRENT TIME is: ${now}.
    
    CRITICAL REQUIREMENTS:
    1. Distance must be in MILES.
    2. Duration: "X hr Y min" or "X min".
    3. Provide 5-7 options.
       - MUST include exactly: "Car Ride" (simulate Uber/Bolt/Taxi options with different prices), "Walking", "Bus", "Tube".
       - Use these exact string values for 'mode': 'Walking', 'Bus', 'Car Ride', 'Tube', 'Train', 'Bicycle'.
       - For WALKING: Tag as 'Free'. Details: "Walk via [Street Name], past [Landmark]".
       - For TRANSIT: Tag the lowest cost PAID option as 'Cheapest'. Tag the best balance of time/cost as 'Best'.
    4. BREAKDOWN (Segments):
       - MUST include: "Platform X", "Stop [Name]", "Walk down [Street Name]", "Near [Trademark/Landmark]".
       - Be specific: "Tube: Victoria Line (Plat 3) to Euston".
    5. Traffic: Estimate realistic traffic (Light, Moderate, Heavy).
    6. Schedule: 
       - "nextDeparture" MUST be a time AFTER ${now}. (e.g. if now is 14:00, next is 14:05).
       - "nextDepartures" MUST be a list of 3 times strictly AFTER ${now}.
    7. Points of Interest: 
       - Include 'Events' (e.g., 'Street Market', 'Live Music') happening along the route. Provide interesting descriptions (2 sentences).
       - Include 'Coffee' shops (e.g. 'Joe & The Juice', 'Local Café') along the route.
       - Include 'Accessibility' features (e.g. 'Step-free access at Station', 'Lift available', 'Ramp access').
       - Include 'Park' (Green spaces), 'Bar' (Pubs/Nightlife), 'Hotel' (Accommodation) if relevant.
    8. Optimization: AI Suggestion should compare money vs time.
    
    Provide simulated weather data for origin, mid-route, and destination.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      // Relaxed schema to prevent RPC errors
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          from: { type: Type.STRING },
          to: { type: Type.STRING },
          transitStatus: { type: Type.STRING },
          aiSuggestion: { type: Type.STRING },
          pointsOfInterest: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING }, // 'Coffee', 'Accessibility', 'Event', 'Park', 'Bar', 'Hotel', etc.
                description: { type: Type.STRING }
              }
            }
          },
          weather: {
            type: Type.OBJECT,
            properties: {
              origin: { 
                type: Type.OBJECT, 
                properties: { temp: { type: Type.STRING }, condition: { type: Type.STRING }, icon: { type: Type.STRING } } 
              },
              midRoute: { 
                type: Type.OBJECT, 
                properties: { temp: { type: Type.STRING }, condition: { type: Type.STRING }, icon: { type: Type.STRING } } 
              },
              destination: { 
                type: Type.OBJECT, 
                properties: { temp: { type: Type.STRING }, condition: { type: Type.STRING }, icon: { type: Type.STRING } } 
              }
            }
          },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                mode: { type: Type.STRING },
                duration: { type: Type.STRING },
                distance: { type: Type.STRING },
                cost: { type: Type.STRING },
                co2: { type: Type.STRING },
                tag: { type: Type.STRING, nullable: true },
                tagColor: { type: Type.STRING, nullable: true },
                status: { type: Type.STRING, nullable: true },
                details: { type: Type.STRING },
                transitLines: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                },
                trafficCondition: { type: Type.STRING, nullable: true },
                nextDeparture: { type: Type.STRING },
                arrivalEstimate: { type: Type.STRING },
                nextDepartures: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                },
                segments: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      mode: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      description: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No data received from Gemini");
  }

  const data = JSON.parse(response.text) as RouteData;
  return data;
};
