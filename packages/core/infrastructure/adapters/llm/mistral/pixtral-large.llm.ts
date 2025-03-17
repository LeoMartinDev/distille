import {
  makeMistralLlmFactory,
  type MistralLlmFactory,
} from "./mistral.llm.ts";

export const pixtralLargeLlmFactory: MistralLlmFactory = makeMistralLlmFactory({
  model: "pixtral-large",
  features: {
    vision: true,
  },
});
