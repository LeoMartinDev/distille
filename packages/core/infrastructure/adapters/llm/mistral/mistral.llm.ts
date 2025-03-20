import { Mistral } from "@mistralai/mistralai";
import type { Features, Llm } from "../../../../application/ports/llm.ts";
import { getDataFromResponse, toMistralAiMessages } from "./utils.ts";

export type MistralLlmFactory = (args: {
  apiKey: string;
}) => Llm;

export const makeMistralLlmFactory = <Model extends string>(args: {
  model: Model;
  features: Features;
}): MistralLlmFactory => {
  return ({
    apiKey,
  }: {
    apiKey: string;
  }): Llm => {
    const client = new Mistral({ apiKey });
    return {
      parse: async (
        { schema, messages },
      ) => {
        const response = await client.chat.complete({
          model: `${args.model}-latest`,
          messages: toMistralAiMessages(args.features, messages),
          responseFormat: {
            type: "json_schema",
            jsonSchema: {
              name: "response",
              schemaDefinition: schema as { [key: string]: unknown },
              strict: true,
            },
          },
        });

        return {
          data: getDataFromResponse({ schema, response }),
          usage: {
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          },
          schema,
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
