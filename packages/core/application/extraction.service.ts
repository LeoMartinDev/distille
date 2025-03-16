import type { JSONSchema } from "json-schema-to-ts";

import {
  createExtraction,
  type Extraction,
} from "../domain/entities/extraction.entity.ts";
import type { Llm, Message } from "./ports/llm.ts";
import type { Loader } from "./ports/loader.ts";

export type ExtractionServiceDependencies<L extends Llm> = {
  llms: L[];
};

export const extractionServiceFactory = <L extends Llm>({
  llms,
}: ExtractionServiceDependencies<L>) => {
  return {
    extract: async <Schema extends JSONSchema>(
      args: {
        loader: Loader;
        schema: Schema;
        messages?: Message<L["features"]>[];
        model: L["model"];
      },
    ): Promise<Extraction> => {
      if (!llms.some((llm) => llm.model === args.model)) {
        throw new Error(`Model ${args.model} is not supported`);
      }

      const content = await args.loader.load();

      if (!content) {
        throw new Error("Failed to load content");
      }

      const messages: Message<L["features"]>[] = [
        {
          role: "system",
          content: {
            type: "text",
            text:
              "You are an expert at extracting data from documents. You will be given the text content of a document and you will need to extract the data from it.",
          },
        },
        ...(args.messages ?? []),
        {
          role: "user",
          content: {
            type: "text",
            text: content,
          },
        },
      ] as const;

      const llmResult = await llms.find((llm) => llm.model === args.model)!
        .parse({
          schema: args.schema,
          messages,
        });

      return createExtraction({
        id: crypto.randomUUID(),
        schema: args.schema,
        model: args.model,
        data: llmResult.data,
        createdAt: Temporal.Now.instant(),
        usage: llmResult.usage,
      });
    },
    get availableModels(): string[] {
      return llms.map((llm) => llm.model);
    },
  };
};
