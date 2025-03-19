/**
 * Schema Converter for Gemini LLM
 *
 * This module provides utilities for converting our internal schema format
 * to Gemini's ResponseSchema format used for structured output generation.
 */

import { type ResponseSchema, SchemaType } from "@google/generative-ai";
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

/**
 * Type guard for union schemas (oneOf, anyOf, allOf)
 */
export function isUnionSchema(schema: Schema): schema is UnionSchema {
  return "oneOf" in schema || "anyOf" in schema || "allOf" in schema;
}

/**
 * Type guard for string schemas
 */
export function isStringSchema(schema: Schema): schema is StringSchema {
  return "type" in schema &&
    (schema.type === "string" ||
      (Array.isArray(schema.type) && schema.type[0] === "string"));
}

/**
 * Type guard for number schemas
 */
export function isNumberSchema(schema: Schema): schema is NumberSchema {
  return "type" in schema &&
    (schema.type === "number" ||
      (Array.isArray(schema.type) && schema.type[0] === "number"));
}

/**
 * Type guard for integer schemas
 */
export function isIntegerSchema(schema: Schema): schema is IntegerSchema {
  return "type" in schema &&
    (schema.type === "integer" ||
      (Array.isArray(schema.type) && schema.type[0] === "integer"));
}

/**
 * Type guard for boolean schemas
 */
export function isBooleanSchema(schema: Schema): schema is BooleanSchema {
  return "type" in schema &&
    (schema.type === "boolean" ||
      (Array.isArray(schema.type) && schema.type[0] === "boolean"));
}

/**
 * Type guard for array schemas
 */
export function isArraySchema(schema: Schema): schema is ArraySchema {
  return "type" in schema &&
    (schema.type === "array" ||
      (Array.isArray(schema.type) && schema.type[0] === "array"));
}

/**
 * Type guard for object schemas
 */
export function isObjectSchema(schema: Schema): schema is ObjectSchema {
  return "type" in schema &&
    (schema.type === "object" ||
      (Array.isArray(schema.type) && schema.type[0] === "object"));
}

/**
 * Type guard for null schemas
 */
export function isNullSchema(schema: Schema): schema is NullSchema {
  return "type" in schema && schema.type === "null";
}

/**
 * Type guard for schemas with type arrays
 */
export function hasTypeArray(
  schema: Schema,
): schema is Schema & { type: string[] } {
  return "type" in schema && Array.isArray(schema.type);
}

/**
 * Gets the primary type from a schema
 */
export function getSchemaType(schema: Schema): string | undefined {
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
 * Converts our internal Schema type to Gemini's ResponseSchema format
 *
 * This function handles complex schema transformations including:
 * - Union schemas (oneOf, anyOf, allOf)
 * - Nullable schemas
 * - Array schemas
 * - Object schemas with properties
 * - Basic types (string, number, boolean, etc.)
 *
 * @param schema Our internal schema format
 * @returns Gemini compatible ResponseSchema
 */
export function convertToGeminiSchema(schema: Schema): ResponseSchema {
  if (!schema) {
    throw new Error("Schema is required");
  }

  function convertSchema(schema: Schema): ResponseSchema {
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
        const mergedSchema: ResponseSchema = {
          type: SchemaType.OBJECT,
          properties: {} as Record<string, ResponseSchema>,
          required: [] as string[],
          description: schema.description,
        };

        schemas.forEach((subschema) => {
          if (isObjectSchema(subschema) && subschema.properties) {
            for (const [key, value] of Object.entries(subschema.properties)) {
              mergedSchema.properties![key] = convertSchema(value);
            }
          }

          if (isObjectSchema(subschema) && subschema.required) {
            mergedSchema.required = [
              ...mergedSchema.required!,
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
      // Since we're in hasTypeArray(schema) condition, we know type is an array
      // But TypeScript needs explicit casting to recognize this
      const schemaTypeArray = schema.type as string[];
      const otherTypes = schemaTypeArray.slice(1).join(", ");

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

      // Make sure format is either undefined or a valid string format
      const format = "format" in schema && schema.format
        ? (schema.format === "date-time" ? "date-time" as const : undefined)
        : undefined;

      return {
        type: SchemaType.STRING,
        format,
        description: schema.description,
      };
    }

    if (isNumberSchema(schema)) {
      // Provide a valid format value for number type
      const format = "format" in schema && typeof schema.format === "string"
        ? schema.format as "float" | "double" | undefined
        : "double";

      return {
        type: SchemaType.NUMBER,
        format,
        description: schema.description,
      };
    }

    if (isIntegerSchema(schema)) {
      // Provide a valid format value for integer type
      const format = "format" in schema && typeof schema.format === "string"
        ? schema.format as "int32" | "int64" | undefined
        : "int32";

      return {
        type: SchemaType.INTEGER,
        format,
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
      const properties: Record<string, ResponseSchema> = {};

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

    // Handle objects without explicit type but with properties
    if (
      typeof schema === "object" &&
      schema !== null &&
      "properties" in schema
    ) {
      // Use a type assertion to tell TypeScript this has properties
      const schemaWithProperties = schema as {
        properties: Record<string, ResponseSchema>;
      };

      if (schemaWithProperties.properties) {
        // Cast to ObjectSchema to handle the case
        const objectSchema: ObjectSchema = {
          ...schema as object, // Cast to object to fix spread error
          type: "object",
        } as ObjectSchema;

        return convertSchema(objectSchema);
      }
    }

    throw new Error(`Cannot determine schema type: ${JSON.stringify(schema)}`);
  }

  return convertSchema(schema);
}
