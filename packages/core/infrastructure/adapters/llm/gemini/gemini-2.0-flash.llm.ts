import { type GeminiLlmFactory, makeGeminiLlmFactory } from "./gemini.llm.ts";

export const makeGemini20FlashLlmFactory: GeminiLlmFactory =
  makeGeminiLlmFactory({
    model: "gemini-2.0-flash",
    features: {
      vision: true,
    },
  });
