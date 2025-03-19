import {
  GoogleGenerativeAI,
  type ResponseSchema,
  SchemaType,
} from "@google/generative-ai";
import type { Features, Llm } from "../../../../application/ports/llm.ts";
import type {
  ArraySchema,
  BooleanSchema,
  IntegerSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  Schema,
  StringSchema,
  UnionSchema,
} from "../../../../domain/entities/extraction.entity.ts";

export type GeminiLlmFactory = (args: {
  apiKey: string;
}) => Llm;

// Helper type for schemas with type arrays
type SchemaWithTypeArray = Extract<Schema, { type: string[] }>;

//https://ai.google.dev/gemini-api/docs/structured-output?hl=fr&lang=node

/**
 * Type guards for schema types
 */
function isUnionSchema(schema: Schema): schema is UnionSchema {
  return "oneOf" in schema || "anyOf" in schema || "allOf" in schema;
}

function isStringSchema(schema: Schema): schema is StringSchema {
  return "type" in schema &&
    (schema.type === "string" ||
      (Array.isArray(schema.type) && schema.type[0] === "string"));
}

function isNumberSchema(schema: Schema): schema is NumberSchema {
  return "type" in schema &&
    (schema.type === "number" ||
      (Array.isArray(schema.type) && schema.type[0] === "number"));
}

function isIntegerSchema(schema: Schema): schema is IntegerSchema {
  return "type" in schema &&
    (schema.type === "integer" ||
      (Array.isArray(schema.type) && schema.type[0] === "integer"));
}

function isBooleanSchema(schema: Schema): schema is BooleanSchema {
  return "type" in schema &&
    (schema.type === "boolean" ||
      (Array.isArray(schema.type) && schema.type[0] === "boolean"));
}

function isArraySchema(schema: Schema): schema is ArraySchema {
  return "type" in schema &&
    (schema.type === "array" ||
      (Array.isArray(schema.type) && schema.type[0] === "array"));
}

function isObjectSchema(schema: Schema): schema is ObjectSchema {
  return "type" in schema &&
    (schema.type === "object" ||
      (Array.isArray(schema.type) && schema.type[0] === "object"));
}

function isNullSchema(schema: Schema): schema is NullSchema {
  return "type" in schema && schema.type === "null";
}

function hasTypeArray(schema: Schema): schema is Schema & { type: string[] } {
  return "type" in schema && Array.isArray(schema.type);
}

function getSchemaType(schema: Schema): string | undefined {
  if (isUnionSchema(schema)) {
    return undefined;
  }

  if ("type" in schema) {
    if (Array.isArray(schema.type)) {
      return schema.type[0];
    }

    return schema.type;
  }

  return undefined;
}

/**
 * Converts our Schema type to Gemini's ResponseSchema format
 */
function convertToGeminiSchema(schema: Schema): ResponseSchema {
  if (!schema) {
    throw new Error("Schema is required");
  }

  function convertSchema(schema: Schema): any {
    // Handle union schema (oneOf, anyOf, allOf)
    if (isUnionSchema(schema)) {
      const unionType = "oneOf" in schema
        ? "oneOf"
        : "anyOf" in schema
        ? "anyOf"
        : "allOf";
      const schemas = schema[unionType] || [];

      // Check for nullable pattern (oneOf with one null and one non-null schema)
      if (schemas.length === 2) {
        const nullSchema = schemas.find((s) => isNullSchema(s));
        const nonNullSchema = schemas.find((s) => !isNullSchema(s));

        if (nullSchema && nonNullSchema) {
          const converted = convertSchema(nonNullSchema);
          return {
            ...converted,
            nullable: true,
          };
        }
      }

      // For allOf with object composition, merge the properties
      if (unionType === "allOf") {
        // For simplicity, we'll merge properties from all schemas
        const mergedSchema = {
          type: SchemaType.OBJECT,
          properties: {} as Record<string, any>,
          required: [] as string[],
          description: schema.description,
        };

        schemas.forEach((subschema) => {
          if (isObjectSchema(subschema) && subschema.properties) {
            for (const [key, value] of Object.entries(subschema.properties)) {
              mergedSchema.properties[key] = convertSchema(value);
            }
          }

          if (isObjectSchema(subschema) && subschema.required) {
            mergedSchema.required = [
              ...mergedSchema.required,
              ...subschema.required,
            ];
          }
        });

        return mergedSchema;
      }

      // Otherwise, use the first schema and mention alternatives in description
      const baseSchema = convertSchema(schemas[0]);
      const otherTypes = schemas.slice(1)
        .map((s) => {
          const type = getSchemaType(s);
          return type || "complex schema";
        })
        .join(", ");

      const firstType = getSchemaType(schemas[0]) || "object";

      return {
        ...baseSchema,
        description: baseSchema.description
          ? `${baseSchema.description} (Alternative types: ${otherTypes})`
          : `One of multiple types: ${firstType}, ${otherTypes}`,
      };
    }

    // Handle type arrays (usually for nullable in JSON Schema)
    if (hasTypeArray(schema)) {
      // Now TypeScript knows schema.type is a string array
      if (schema.type.includes("null")) {
        const primaryType = schema.type.find((t: string) => t !== "null");
        if (primaryType) {
          // Create a new schema with the non-null type
          const schemaWithPrimaryType = {
            ...schema as object, // Cast to object to fix spread error
            type: primaryType,
          };

          // Need to type-cast here based on primaryType
          let typedSchema: Schema;
          switch (primaryType) {
            case "string":
              typedSchema = schemaWithPrimaryType as StringSchema;
              break;
            case "number":
              typedSchema = schemaWithPrimaryType as NumberSchema;
              break;
            case "integer":
              typedSchema = schemaWithPrimaryType as IntegerSchema;
              break;
            case "boolean":
              typedSchema = schemaWithPrimaryType as BooleanSchema;
              break;
            case "array":
              typedSchema = schemaWithPrimaryType as ArraySchema;
              break;
            case "object":
              typedSchema = schemaWithPrimaryType as ObjectSchema;
              break;
            default:
              throw new Error(`Unsupported primary type: ${primaryType}`);
          }

          const converted = convertSchema(typedSchema);
          return {
            ...converted,
            nullable: true,
          };
        }
      }

      // For other type arrays, use the first type and note others in description
      const primaryType = schema.type[0];
      const otherTypes = schema.type.slice(1).join(", ");

      // Create a new schema with single type
      let updatedSchema: Schema;
      const baseUpdated = {
        ...schema as object, // Cast to object to fix spread error
        type: primaryType,
        description: schema.description
          ? `${schema.description} (Could also be: ${otherTypes})`
          : `Could be one of: ${
            Array.isArray(schema.type) ? schema.type.join(", ") : primaryType
          }`,
      };

      // Type cast based on the primary type
      switch (primaryType) {
        case "string":
          updatedSchema = baseUpdated as StringSchema;
          break;
        case "number":
          updatedSchema = baseUpdated as NumberSchema;
          break;
        case "integer":
          updatedSchema = baseUpdated as IntegerSchema;
          break;
        case "boolean":
          updatedSchema = baseUpdated as BooleanSchema;
          break;
        case "array":
          updatedSchema = baseUpdated as ArraySchema;
          break;
        case "object":
          updatedSchema = baseUpdated as ObjectSchema;
          break;
        default:
          throw new Error(`Unsupported primary type: ${primaryType}`);
      }

      return convertSchema(updatedSchema);
    }

    // Handle basic types
    if (isStringSchema(schema)) {
      if ("enum" in schema && schema.enum) {
        return {
          type: SchemaType.STRING,
          format: "enum",
          enum: schema.enum,
          description: schema.description,
        };
      }
      return {
        type: SchemaType.STRING,
        format: "format" in schema ? schema.format : undefined,
        description: schema.description,
      };
    }

    if (isNumberSchema(schema)) {
      return {
        type: SchemaType.NUMBER,
        format: "format" in schema ? schema.format : "double",
        description: schema.description,
      };
    }

    if (isIntegerSchema(schema)) {
      return {
        type: SchemaType.INTEGER,
        format: "format" in schema ? schema.format : "int32",
        description: schema.description,
      };
    }

    if (isBooleanSchema(schema)) {
      return {
        type: SchemaType.BOOLEAN,
        description: schema.description,
      };
    }

    if (isArraySchema(schema)) {
      if (!schema.items) {
        throw new Error("Array schema must have items property");
      }

      return {
        type: SchemaType.ARRAY,
        items: convertSchema(schema.items),
        minItems: "minItems" in schema ? schema.minItems : undefined,
        maxItems: "maxItems" in schema ? schema.maxItems : undefined,
        description: schema.description,
      };
    }

    if (isObjectSchema(schema)) {
      const properties: Record<string, any> = {};

      if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
          properties[key] = convertSchema(value);
        }
      }

      return {
        type: SchemaType.OBJECT,
        properties,
        required: schema.required,
        description: schema.description,
      };
    }

    if (isNullSchema(schema)) {
      return {
        type: SchemaType.STRING,
        description: schema.description || "Must be null",
        nullable: true,
      };
    }

    // Fix the properties check around line 340
    if (
      "properties" in schema && typeof schema === "object" && schema.properties
    ) {
      // Cast to ObjectSchema to handle the case
      const objectSchema: ObjectSchema = {
        ...schema as object, // Cast to object to fix spread error
        type: "object",
      } as ObjectSchema;

      return convertSchema(objectSchema);
    }

    throw new Error(`Cannot determine schema type: ${JSON.stringify(schema)}`);
  }

  return convertSchema(schema);
}

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
        // Convert our schema to Gemini's format
        const responseSchema = convertToGeminiSchema(schema as Schema);

        console.log(
          "Converted schema:",
          JSON.stringify(responseSchema, null, 2),
        );

        const model = client.getGenerativeModel({
          model: args.model,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
          },
        });

        const result = await model.generateContent({
          contents: messages.map((message) => ({
            role: message.role === "system" ? "user" : message.role,
            parts: [{
              text: message.content.text,
            }],
          })),
        });

        console.log(result.response.text());

        return {
          data: result.response.text() ?? null,
          usage: {
            promptTokens: result.response.usageMetadata?.promptTokenCount ?? -1,
            completionTokens:
              result.response.usageMetadata?.candidatesTokenCount ?? -1,
            totalTokens: result.response.usageMetadata?.totalTokenCount ?? -1,
          },
        };
      },
      model: args.model,
      features: args.features,
    };
  };
};
