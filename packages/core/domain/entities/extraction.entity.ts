import type { FromSchema as FromJsonSchema } from "json-schema-to-ts";
import { randomUUID } from "node:crypto";
import type { SerializableJSON } from "../utils/types.ts";
import { validateJsonSchema } from "../utils/validate-json-schema.ts";

export type Schema = {
  type: string | string[];
  description?: string;

  // For objects
  properties?: Record<string, Schema>;
  required?: string[];

  // For arrays
  items?: Schema;
  minItems?: number;
  maxItems?: number;

  // For strings
  enum?: string[];
  format?: string;

  // For numbers/integers
  minimum?: number;
  maximum?: number;

  // Unions (works directly with OpenAI)
  oneOf?: Schema[];
};

export type FromSchema<S extends Schema> = FromJsonSchema<S>;

export type Extraction = {
  id: string;
  createdAt: Temporal.Instant;
  model: string;
  schema: Schema;
  data: SerializableJSON;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export const createExtraction = ({
  id = randomUUID(),
  createdAt = Temporal.Now.instant(),
  model,
  schema,
  data,
  usage,
}: Extraction): Extraction => {
  const isDataValid = validateJsonSchema(schema, data);

  if (!isDataValid) {
    throw new Error("Invalid data");
  }

  return {
    id,
    createdAt,
    model,
    schema,
    data,
    usage,
  };
};
