import {
  type ExtractionService,
  extractionServiceFactory,
} from "./application/extraction.service.ts";
import type { Llm } from "./application/ports/llm.ts";
import {
  gemini,
  mistral,
  openai,
} from "./infrastructure/adapters/llm/index.ts";

type LlmFactory = (args: { apiKey: string }) => Llm;

const getLLMs = (
  adapter: Record<string, LlmFactory>,
  apiKey?: string,
): Llm[] => {
  if (!apiKey) return [];
  return Object.values(adapter).map((llm) => llm({ apiKey }));
};

export { extractionServiceFactory };

export const makeExtractionService = (args: {
  mistral?: { apiKey: string };
  openai?: { apiKey: string };
  gemini?: { apiKey: string };
}): ExtractionService<Llm> => {
  if (!args.mistral?.apiKey && !args.openai?.apiKey && !args.gemini?.apiKey) {
    throw new Error("No API keys provided");
  }

  const llms = [
    ...getLLMs(mistral, args.mistral?.apiKey),
    ...getLLMs(openai, args.openai?.apiKey),
    ...getLLMs(gemini, args.gemini?.apiKey),
  ];

  return extractionServiceFactory({ llms });
};
