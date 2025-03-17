import {
  makeMistralLlmFactory,
  type MistralLlmFactory,
} from "./mistral.llm.ts";

export const mistralLarge: MistralLlmFactory = makeMistralLlmFactory({
  model: "mistral-large",
  features: {
    vision: false,
  },
});
