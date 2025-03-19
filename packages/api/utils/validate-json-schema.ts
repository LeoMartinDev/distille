import type { Schema } from "../../core/domain/entities/extraction.entity.ts";
import { Ajv } from "ajv";

const ajv = new Ajv();

export const makeValidateJsonSchema = ({
  schema,
}: {
  schema: Schema;
}) => {
  const validate = ajv.compile(schema);

  return ({ data }: { data: unknown }) => validate(data);
};
