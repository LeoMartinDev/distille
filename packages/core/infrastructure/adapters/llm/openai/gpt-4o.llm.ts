import { makeOpenaiLlmFactory } from "./openai.llm.ts";

export const gpt4oLlmServiceFactory = makeOpenaiLlmFactory({
  model: "gpt-4o",
  features: {
    vision: true,
  },
});
