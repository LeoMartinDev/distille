import { GoogleGenerativeAI, type ResponseSchema } from "@google/generative-ai";
import type { Features, Llm } from "../../../../application/ports/llm.ts";
import convert from "@openapi-contrib/json-schema-to-openapi-schema";

export type GeminiLlmFactory = (args: {
  apiKey: string;
}) => Llm;

export const makeGeminiLlmFactory = <Model extends string>(args: {
  model: Model;
  features: Features;
}): GeminiLlmFactory => {
  return ({
    apiKey,
  }: {
    apiKey: string;
  }): Llm => {
    const client = new GoogleGenerativeAI(apiKey);

    return {
      parse: async ({ schema, messages }) => {
        const responseSchema = await convert(
          schema as unknown as object,
        ) as unknown as ResponseSchema;

        console.log(responseSchema);

        const model = client.getGenerativeModel({
          model: args.model,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const result = await model.generateContent({
          contents: messages.map((message) => ({
            role: message.role,
            parts: [message.content],
          })),
        });

        console.log(result.response.text());

        return {
          data: result.response.text() ?? null,
          usage: {
            promptTokens: result.response.usageMetadata?.promptTokenCount ?? -1,
            completionTokens:
              result.response.usageMetadata?.candidatesTokenCount ?? -1,
            totalTokens: result.response.usageMetadata?.totalTokenCount ?? -1,
          },
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
