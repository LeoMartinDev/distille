import type { JSONSchema } from "json-schema-to-ts";
import { Ajv } from "ajv";

const ajv = new Ajv({
  strict: false,
  strictSchema: false,
  strictTypes: false,
  allowUnionTypes: true,
});

export const makeValidateJsonSchema = ({
  schema,
}: {
  schema: JSONSchema;
}) => {
  const validate = ajv.compile(schema);

  return ({ data }: { data: unknown }) => {
    const isValid = validate(data);
    console.log(validate.errors);
    return isValid;
  };
};
