import OpenAI from "@openai/openai";
import {
  type Features,
  isVisionContent,
  type Llm,
  type Message,
  type VisionContent,
} from "../../../../application/ports/llm.ts";

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

export const makeOpenaiLlmFactory = <Model extends string>(args: {
  model: Model;
  features: Features;
}) => {
  return ({
    apiKey,
  }: {
    apiKey: string;
  }): Llm => {
    const client = new OpenAI({ apiKey });

    return {
      parse: async ({ schema, messages }) => {
        const response = await client.beta.chat.completions.parse({
          model: args.model,
          messages: toOpenAiMessages(args.features, messages),
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "response",
              schema: schema as unknown as Record<string, unknown>,
              strict: true,
            },
          },
        });

        console.log("response", response.choices?.[0]?.message);

        const data = response.choices?.[0]?.message?.parsed ?? null;

        return {
          data,
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
