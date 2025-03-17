import {
  makeMistralLlmFactory,
  type MistralLlmFactory,
} from "./mistral.llm.ts";

export const pixtralLarge: MistralLlmFactory = makeMistralLlmFactory({
  model: "pixtral-large",
  features: {
    vision: true,
  },
});
