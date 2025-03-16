import { Mistral } from "@mistralai/mistralai";
import type { JSONSchema } from "json-schema-to-ts";
import {
  type Features,
  isVisionContent,
  type Llm,
  type Message,
  type VisionContent,
} from "../../../../application/ports/llm.ts";
import { validateJsonSchema } from "../../../../domain/utils/validate-json-schema.ts";

const safeJsonParse = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (_error) {
    return null;
  }
};

const getData = (
  schema: JSONSchema,
  data: Awaited<ReturnType<Mistral["chat"]["complete"]>>,
) => {
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  if (Array.isArray(content)) {
    return null;
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

const toMistralAiMessages = (
  features: Features,
  messages: Message<typeof features>[],
) =>
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

export const makeMistralLlmFactory = <Model extends string>(args: {
  model: Model;
  features: Features;
}) => {
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
          data: getData(schema, response),
          usage: {
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          },
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
