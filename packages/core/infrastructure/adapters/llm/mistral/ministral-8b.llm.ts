import { makeMistralLlmFactory } from "./mistral.llm.ts";

export const ministral8bLlmFactory = makeMistralLlmFactory({
  model: "ministral-8b",
  features: {
    vision: false,
  },
});
