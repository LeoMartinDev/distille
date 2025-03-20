import OpenAI from "@openai/openai";
import type { Features, Llm } from "../../../../application/ports/llm.ts";
import { prepareSchemaForOpenAI, toOpenAiMessages } from "./utils.ts";

export type OpenaiLlmFactory = (args: {
  apiKey: string;
}) => Llm;

export const makeOpenaiLlmFactory = <Model extends string>(args: {
  model: Model;
  features: Features;
}): OpenaiLlmFactory => {
  return ({
    apiKey,
  }: {
    apiKey: string;
  }): Llm => {
    const client = new OpenAI({ apiKey });

    return {
      parse: async ({ schema, messages }) => {
        const responseSchema = prepareSchemaForOpenAI(schema);
        const response = await client.beta.chat.completions.parse({
          model: args.model,
          messages: toOpenAiMessages(args.features, messages),
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "response",
              schema: responseSchema,
              strict: true,
            },
          },
        });

        const data = response.choices?.[0]?.message?.parsed ?? null;

        return {
          data,
          usage: {
            promptTokens: response.usage?.prompt_tokens ?? -1,
            completionTokens: response.usage?.completion_tokens ?? -1,
            totalTokens: response.usage?.total_tokens ?? -1,
          },
          schema: responseSchema,
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
