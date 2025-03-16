import { makeOpenaiLlmFactory } from "./openai.llm.ts";

export const gpt4oMiniLlmServiceFactory = makeOpenaiLlmFactory({
  model: "gpt-4o-mini",
  features: {
    vision: true,
  },
});
