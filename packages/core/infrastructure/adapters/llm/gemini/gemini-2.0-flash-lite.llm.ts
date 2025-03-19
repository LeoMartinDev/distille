import { type GeminiLlmFactory, makeGeminiLlmFactory } from "./gemini.llm.ts";

export const gemini20FlashLite: GeminiLlmFactory = makeGeminiLlmFactory({
  model: "gemini-2.0-flash-lite",
  features: {
    vision: true,
  },
});
