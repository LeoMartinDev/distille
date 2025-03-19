import type { FromSchema as FromJsonSchema } from "json-schema-to-ts";
import { randomUUID } from "node:crypto";
import type { SerializableJSON } from "../utils/types.ts";
import { validateJsonSchema } from "../utils/validate-json-schema.ts";

// Base schema interface with common properties
export interface BaseSchema {
  description?: string;
}

// String schema
export interface StringSchema extends BaseSchema {
  type: "string" | ["string", "null"];
  enum?: string[];
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

// Number schema
export interface NumberSchema extends BaseSchema {
  type: "number" | ["number", "null"];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

// Integer schema
export interface IntegerSchema extends BaseSchema {
  type: "integer" | ["integer", "null"];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

// Boolean schema
export interface BooleanSchema extends BaseSchema {
  type: "boolean" | ["boolean", "null"];
}

// Array schema
export interface ArraySchema extends BaseSchema {
  type: "array" | ["array", "null"];
  items: Schema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

// Object schema
export interface ObjectSchema extends BaseSchema {
  type: "object" | ["object", "null"];
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean | Schema;
}

// Null schema
export interface NullSchema extends BaseSchema {
  type: "null";
}

// Union schema (for oneOf, anyOf, allOf)
export interface UnionSchema extends BaseSchema {
  oneOf?: Schema[];
  anyOf?: Schema[];
  allOf?: Schema[];
}

// Combine all schema types
export type Schema =
  | StringSchema
  | NumberSchema
  | IntegerSchema
  | BooleanSchema
  | ArraySchema
  | ObjectSchema
  | NullSchema
  | UnionSchema;

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
