import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Features, Llm } from "../../../../application/ports/llm.ts";
import { safeJsonParse } from "../../utils/safe-json-parse.ts";
import { convertToGeminiSchema, toGeminiMessages } from "./utils.ts";

/**
 * Factory type for creating Gemini LLM instances
 */
export type GeminiLlmFactory = (args: {
  apiKey: string;
}) => Llm;

//https://ai.google.dev/gemini-api/docs/structured-output?hl=fr&lang=node

/**
 * Creates a factory function for Gemini LLM instances
 *
 * @param args Configuration options including model name and supported features
 * @returns A factory function that creates Gemini LLM instances
 */
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
        const responseSchema = convertToGeminiSchema(schema);

        const model = client.getGenerativeModel({
          model: args.model,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const result = await model.generateContent({
          contents: toGeminiMessages(args.features, messages),
        });

        return {
          data: safeJsonParse(result.response.text()),
          usage: {
            promptTokens: result.response.usageMetadata?.promptTokenCount ?? -1,
            completionTokens:
              result.response.usageMetadata?.candidatesTokenCount ?? -1,
            totalTokens: result.response.usageMetadata?.totalTokenCount ?? -1,
          },
          schema: responseSchema,
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
