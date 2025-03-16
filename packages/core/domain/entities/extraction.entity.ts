import { randomUUID } from "node:crypto";
import type { JSONSchema } from "json-schema-to-ts";
import { validateJsonSchema } from "../utils/validate-json-schema.ts";

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Represents a JSON object with string keys and JSON values
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Represents a JSON array of JSON values
 */
export type JSONArray = JSONValue[];

/**
 * Represents all serializable JSON data
 */
export type SerializableJSON = JSONValue;

export type Extraction = {
  id: string;
  createdAt: Temporal.Instant;
  model: string;
  schema: JSONSchema;
  data: SerializableJSON;
};

export const createExtraction = ({
  id = randomUUID(),
  createdAt = Temporal.Now.instant(),
  model,
  schema,
  data,
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
  };
};
