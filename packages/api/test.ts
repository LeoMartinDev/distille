import { Ajv } from "ajv";
import { schemaJsonSchema } from "./schemas/schema.json-schema.ts";

const ajv = new Ajv({
  strict: false,
  strictSchema: false,
  strictTypes: false,
  allowUnionTypes: true,
});

const validate = ajv.compile(schemaJsonSchema);
const isValid = validate({
  "type": "object",
  "properties": {
    "clientName": {
      "type": "string",
    },
  },
  "required": ["clientName"],
});

console.log(isValid);
console.log(validate.errors);
