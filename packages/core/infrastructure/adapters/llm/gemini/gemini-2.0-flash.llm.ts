import { type GeminiLlmFactory, makeGeminiLlmFactory } from "./gemini.llm.ts";

export const gemini20Flash: GeminiLlmFactory = makeGeminiLlmFactory({
  model: "gemini-2.0-flash",
  features: {
    vision: true,
  },
});
