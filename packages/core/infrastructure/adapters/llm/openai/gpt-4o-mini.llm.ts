import { makeOpenaiLlmFactory, type OpenaiLlmFactory } from "./openai.llm.ts";

export const gpt4oMiniLlmServiceFactory: OpenaiLlmFactory =
  makeOpenaiLlmFactory({
    model: "gpt-4o-mini",
    features: {
      vision: true,
    },
  });
