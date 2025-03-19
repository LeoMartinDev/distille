import OpenAI from "@openai/openai";
import {
  type Features,
  isVisionContent,
  type Llm,
  type Message,
  type VisionContent,
} from "../../../../application/ports/llm.ts";
import type { Schema } from "../../../../domain/entities/extraction.entity.ts";

export const prepareSchemaForOpenAI = (
  schema: Schema,
): Record<string, unknown> => {
  // Simple validation to ensure it's a proper schema
  if (!schema || typeof schema !== "object") {
    throw new Error("Invalid schema: Schema must be an object");
  }

  // If it's a union schema (oneOf/anyOf/allOf), validate it has the right property
  if (
    "oneOf" in schema &&
    (!Array.isArray(schema.oneOf) || schema.oneOf.length === 0)
  ) {
    throw new Error("Invalid schema: oneOf must be a non-empty array");
  }
  if (
    "anyOf" in schema &&
    (!Array.isArray(schema.anyOf) || schema.anyOf.length === 0)
  ) {
    throw new Error("Invalid schema: anyOf must be a non-empty array");
  }
  if (
    "allOf" in schema &&
    (!Array.isArray(schema.allOf) || schema.allOf.length === 0)
  ) {
    throw new Error("Invalid schema: allOf must be a non-empty array");
  }

  return structuredClone(schema) as Record<string, unknown>;
};

const toOpenAiMessages = (
  features: Features,
  messages: Message<typeof features>[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] =>
  messages.map(({ role, content }) => {
    if (role === "system") {
      return {
        role,
        content: content.text,
      };
    }

    if (role === "assistant") {
      return {
        role,
        content: content.text,
      };
    }

    if (role === "user") {
      if (content.type === "text") {
        return {
          role,
          content: content.text,
        };
      }

      if (features.vision && isVisionContent(content)) {
        return {
          role,
          content: [
            {
              type: "text",
              text: (content as VisionContent).text,
            },
            {
              type: "image_url",
              image_url: { url: (content as VisionContent).image },
            },
          ],
        };
      }
    }

    throw new Error(`Unsupported message`);
  });

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
