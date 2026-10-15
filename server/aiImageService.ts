import { GoogleGenAI } from '@google/genai';

export async function generateStudioImage(
  prompt: string,
  aspectRatio: string = '1:1',
  imageSize: string = '1K',
  modelPreference: string = 'gemini-3-pro-image-preview'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Choose requested model or fallback
  const targetModel = modelPreference || 'gemini-3-pro-image-preview';

  try {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
          imageSize: imageSize as "1K" | "2K" | "4K",
        },
      },
    });

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error('No image part returned in model response');
  } catch (err: unknown) {
    const error = err as Error;
    // If the preview model fails due to quota or access, try fallback to gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
    if (targetModel === 'gemini-3-pro-image-preview') {
      try {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
              imageSize: imageSize as "1K" | "2K" | "4K",
            },
          },
        });
        if (fallbackRes?.candidates?.[0]?.content?.parts) {
          for (const part of fallbackRes.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return `data:${mime};base64,${part.inlineData.data}`;
            }
          }
        }
      } catch (fallbackErr: unknown) {
        console.error('Fallback image generation failed:', fallbackErr);
      }
    }
    throw error;
  }
}
