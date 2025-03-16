import { makeMistralLlmFactory } from "./mistral.llm.ts";

export const pixtralLargeLlmFactory = makeMistralLlmFactory({
  model: "pixtral-large",
  features: {
    vision: true,
  },
});
