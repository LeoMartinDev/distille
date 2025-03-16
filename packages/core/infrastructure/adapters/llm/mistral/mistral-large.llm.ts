import { makeMistralLlmFactory } from "./mistral.llm.ts";

export const mistralLargeLlmFactory = makeMistralLlmFactory({
  model: "mistral-large",
  features: {
    vision: false,
  },
});
