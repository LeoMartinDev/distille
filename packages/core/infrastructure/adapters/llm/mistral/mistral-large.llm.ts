import {
  makeMistralLlmFactory,
  type MistralLlmFactory,
} from "./mistral.llm.ts";

export const mistralLargeLlmFactory: MistralLlmFactory = makeMistralLlmFactory({
  model: "mistral-large",
  features: {
    vision: false,
  },
});
