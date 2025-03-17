import "@std/dotenv/load";

import { Ajv } from "ajv";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";

const ajv = new Ajv();

const configSchema = {
  type: "object",
  properties: {
    token: { type: "string", minLength: 1, maxLength: 256 },
    providers: {
      type: "object",
      properties: {
        mistral: {
          type: "object",
          properties: {
            apiKey: { type: "string", minLength: 1, maxLength: 256 },
          },
          required: ["apiKey"],
        },
        openai: {
          type: "object",
          properties: {
            apiKey: { type: "string", minLength: 1, maxLength: 256 },
          },
          required: ["apiKey"],
        },
        gemini: {
          type: "object",
          properties: {
            apiKey: { type: "string", minLength: 1, maxLength: 256 },
          },
          required: ["apiKey"],
        },
      },
      anyOf: [
        { required: ["mistral"] },
        { required: ["openai"] },
        { required: ["gemini"] },
      ],
    },
  },
  required: ["providers"],
} as const satisfies JSONSchema;

export type Config = FromSchema<typeof configSchema>;

const validate = ajv.compile(configSchema);

const rawConfig = {
  token: Deno.env.get("TOKEN"),
  providers: {
    mistral: Deno.env.has("MISTRAL_API_KEY")
      ? { apiKey: Deno.env.get("MISTRAL_API_KEY")! }
      : undefined,
    openai: Deno.env.has("OPENAI_API_KEY")
      ? { apiKey: Deno.env.get("OPENAI_API_KEY")! }
      : undefined,
    gemini: Deno.env.has("GEMINI_API_KEY")
      ? { apiKey: Deno.env.get("GEMINI_API_KEY")! }
      : undefined,
  },
};

if (!validate(rawConfig)) {
  throw new Error(
    `Config validation failed: ${ajv.errorsText(validate.errors)}`,
  );
}

const config = rawConfig as Config;

export default config;
