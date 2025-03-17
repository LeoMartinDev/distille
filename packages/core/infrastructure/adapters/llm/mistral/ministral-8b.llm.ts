import {
  makeMistralLlmFactory,
  type MistralLlmFactory,
} from "./mistral.llm.ts";

export const ministral8bLlmFactory: MistralLlmFactory = makeMistralLlmFactory({
  model: "ministral-8b",
  features: {
    vision: false,
  },
});
