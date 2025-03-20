import type OpenAI from "@openai/openai";
import {
  type Features,
  isVisionContent,
  type Message,
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

export const toOpenAiMessages = (
  features: Features,
  messages: Message[],
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
            ...(content.text
              ? [{
                type: "text" as const,
                text: content.text,
              }]
              : []),
            {
              type: "image_url" as const,
              image_url: { url: content.image },
            },
          ] as OpenAI.Chat.Completions.ChatCompletionContentPart[],
        };
      }
    }

    throw new Error(`Unsupported message`);
  });
