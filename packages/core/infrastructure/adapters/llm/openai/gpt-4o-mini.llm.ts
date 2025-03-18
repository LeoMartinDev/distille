import { makeOpenaiLlmFactory, type OpenaiLlmFactory } from "./openai.llm.ts";

export const gpt4oMini: OpenaiLlmFactory = makeOpenaiLlmFactory({
  model: "gpt-4o-mini",
  features: {
    vision: true,
  },
});
