import type { Mistral } from "@mistralai/mistralai";
import {
  type Features,
  isVisionContent,
  type Message,
  type VisionContent,
} from "../../../../application/ports/llm.ts";
import type { Schema } from "../../../../domain/entities/extraction.entity.ts";
import { safeJsonParse } from "../../utils/safe-json-parse.ts";
import { validateJsonSchema } from "../../../../domain/utils/validate-json-schema.ts";

/**
 * Converts messages from our internal format to Mistral AI's format.
 *
 * @param features - Features supported by the LLM model
 * @param messages - Array of messages in our internal format
 * @returns Array of messages in Mistral AI's format
 * @throws {Error} If an unsupported message role or content type is encountered
 */
export const toMistralAiMessages = (
  features: Features,
  messages: Message[],
): Parameters<Mistral["chat"]["complete"]>[0]["messages"] =>
  messages.map(({ role, content }) => {
    if (role === "system") {
      return {
        role: "system" as const,
        content: content.text,
      };
    }

    if (role === "assistant") {
      return {
        role: "assistant" as const,
        content: content.text,
      };
    }

    if (role === "user") {
      if (content.type === "text") {
        return {
          role: "user" as const,
          content: content.text,
        };
      }

      if (features.vision && isVisionContent(content)) {
        return {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: (content as VisionContent).text,
            },
            {
              type: "image_url" as const,
              imageUrl: { url: (content as VisionContent).image },
            },
          ],
        };
      }

      throw new Error(`Unsupported message`);
    }

    throw new Error(`Unsupported role: ${role}`);
  });

export type MistralResponse = Awaited<ReturnType<Mistral["chat"]["complete"]>>;

/**
 * Extracts data from the response of a Mistral AI chat completion.
 *
 * @param schema - JSON schema to validate the extracted data against
 * @param response - Response from Mistral AI chat completion
 * @returns Extracted data or null if extraction fails
 */
export const getDataFromResponse = ({
  schema,
  response,
}: {
  schema: Schema;
  response: MistralResponse;
}) => {
  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  if (Array.isArray(content)) {
    return null;
  }

  // For string schemas, validate the string content directly
  if ("type" in schema && schema.type === "string") {
    const isValid = validateJsonSchema(schema, content);

    if (!isValid) {
      return null;
    }

    return content;
  }

  const parsed = safeJsonParse(content);

  if (!parsed) {
    return null;
  }

  const isValid = validateJsonSchema(schema, parsed);

  if (!isValid) {
    return null;
  }

  return parsed;
};
