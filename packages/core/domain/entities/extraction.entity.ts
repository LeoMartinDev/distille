import type { JSONSchema } from "json-schema-to-ts";
import { randomUUID } from "node:crypto";
import type { SerializableJSON } from "../utils/types.ts";
import { validateJsonSchema } from "../utils/validate-json-schema.ts";

export type Extraction = {
  id: string;
  createdAt: Temporal.Instant;
  model: string;
  schema: JSONSchema;
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
