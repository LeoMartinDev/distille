import type { JSONSchema } from "json-schema-to-ts";
import { Ajv } from "ajv";

const ajv = new Ajv();

export const validateJsonSchema = (
  schema: JSONSchema,
  data: unknown,
): boolean => {
  const validate = ajv.compile(schema);

  return validate(data);
};
