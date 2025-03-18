import { makeOpenaiLlmFactory, type OpenaiLlmFactory } from "./openai.llm.ts";

export const gpt4o: OpenaiLlmFactory = makeOpenaiLlmFactory({
  model: "gpt-4o",
  features: {
    vision: true,
  },
});
