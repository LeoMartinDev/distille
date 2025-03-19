import { assertEquals, assertThrows } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { SchemaType } from "@google/generative-ai";
import {
  convertToGeminiSchema,
  getSchemaType,
  hasTypeArray,
  isArraySchema,
  isBooleanSchema,
  isIntegerSchema,
  isNullSchema,
  isNumberSchema,
  isObjectSchema,
  isStringSchema,
  isUnionSchema,
} from "./schema-converter.ts";
import type {
  ArraySchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  Schema,
  StringSchema,
  UnionSchema,
} from "../../../../domain/entities/extraction.entity.ts";

describe("Schema Type Guards", () => {
  describe("isStringSchema", () => {
    it("identifies string schemas correctly", () => {
      const stringSchema: StringSchema = { type: "string" };
      const nullableStringSchema: StringSchema = { type: ["string", "null"] };
      const numberSchema: NumberSchema = { type: "number" };

      assertEquals(isStringSchema(stringSchema), true);
      assertEquals(isStringSchema(nullableStringSchema), true);
      assertEquals(isStringSchema(numberSchema), false);
    });
  });

  describe("isNumberSchema", () => {
    it("identifies number schemas correctly", () => {
      const numberSchema: NumberSchema = { type: "number" };
      const nullableNumberSchema: NumberSchema = { type: ["number", "null"] };
      const stringSchema: StringSchema = { type: "string" };

      assertEquals(isNumberSchema(numberSchema), true);
      assertEquals(isNumberSchema(nullableNumberSchema), true);
      assertEquals(isNumberSchema(stringSchema), false);
    });
  });

  describe("hasTypeArray", () => {
    it("detects array type definitions", () => {
      const simpleSchema: StringSchema = { type: "string" };
      const arrayTypeSchema: Schema = { type: ["string", "null"] };

      assertEquals(hasTypeArray(simpleSchema), false);
      assertEquals(hasTypeArray(arrayTypeSchema), true);
    });
  });

  describe("getSchemaType", () => {
    it("returns the primary type from a schema", () => {
      const stringSchema: StringSchema = { type: "string" };
      const nullableNumberSchema: NumberSchema = { type: ["number", "null"] };

      assertEquals(getSchemaType(stringSchema), "string");
      assertEquals(getSchemaType(nullableNumberSchema), "number");
    });
  });
});

describe("Schema Conversion", () => {
  describe("convertToGeminiSchema", () => {
    it("converts string schema correctly", () => {
      const stringSchema: StringSchema = {
        type: "string",
        description: "A test string",
      };

      const result = convertToGeminiSchema(stringSchema);

      assertEquals(result.type, SchemaType.STRING);
      assertEquals(result.description, "A test string");
    });

    it("converts number schema correctly", () => {
      const numberSchema: NumberSchema = {
        type: "number",
        description: "A test number",
      };

      const result = convertToGeminiSchema(numberSchema);

      // We need to type assert since the returned schema has a different type
      const typedResult = result as {
        type: string;
        format: string;
        description?: string;
      };
      assertEquals(typedResult.type, SchemaType.NUMBER);
      assertEquals(typedResult.format, "double");
      assertEquals(typedResult.description, "A test number");
    });

    it("converts boolean schema correctly", () => {
      const boolSchema: BooleanSchema = {
        type: "boolean",
        description: "A test boolean",
      };

      const result = convertToGeminiSchema(boolSchema);

      assertEquals(result.type, SchemaType.BOOLEAN);
      assertEquals(result.description, "A test boolean");
    });

    it("converts array schema correctly", () => {
      const arraySchema: ArraySchema = {
        type: "array",
        items: { type: "string" },
        description: "A test array",
        minItems: 1,
        maxItems: 10,
      };

      const result = convertToGeminiSchema(arraySchema);

      // Type assertion for array schema specific properties
      const typedResult = result as {
        type: string;
        description?: string;
        minItems?: number;
        maxItems?: number;
        items?: any;
      };

      assertEquals(typedResult.type, SchemaType.ARRAY);
      assertEquals(typedResult.description, "A test array");
      assertEquals(typedResult.minItems, 1);
      assertEquals(typedResult.maxItems, 10);
      assertEquals(typedResult.items?.type, SchemaType.STRING);
    });

    it("converts object schema correctly", () => {
      const objectSchema: ObjectSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["name"],
        description: "A test object",
      };

      const result = convertToGeminiSchema(objectSchema);

      // Type assertion for object schema specific properties
      const typedResult = result as {
        type: string;
        description?: string;
        required?: string[];
        properties?: Record<string, any>;
      };

      assertEquals(typedResult.type, SchemaType.OBJECT);
      assertEquals(typedResult.description, "A test object");
      assertEquals(typedResult.required, ["name"]);
      assertEquals(typedResult.properties?.name.type, SchemaType.STRING);
      assertEquals(typedResult.properties?.age.type, SchemaType.INTEGER);
    });

    it("handles nullable types", () => {
      const nullableSchema: StringSchema = {
        type: ["string", "null"],
        description: "A nullable string",
      };

      const result = convertToGeminiSchema(nullableSchema);

      assertEquals(result.type, SchemaType.STRING);
      assertEquals(result.description?.includes("Could also be: null"), true);
    });

    it("handles oneOf with null pattern", () => {
      const unionSchema: UnionSchema = {
        oneOf: [
          { type: "string" },
          { type: "null" },
        ],
        description: "A string or null",
      };

      const result = convertToGeminiSchema(unionSchema);

      // Type assertion for nullable property
      const typedResult = result as {
        type: string;
        nullable?: boolean;
      };

      assertEquals(typedResult.type, SchemaType.STRING);
      assertEquals(typedResult.nullable, true);
    });

    it("handles complex oneOf patterns", () => {
      const unionSchema: UnionSchema = {
        oneOf: [
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
        ],
        description: "A mixed type",
      };

      const result = convertToGeminiSchema(unionSchema);

      assertEquals(result.type, SchemaType.STRING);
      assertEquals(
        result.description?.includes("Alternative types: number, boolean"),
        true,
      );
    });

    it("throws for array schema without items", () => {
      const badArraySchema = {
        type: "array",
        description: "Bad array without items",
      } as ArraySchema;

      assertThrows(
        () => convertToGeminiSchema(badArraySchema),
        Error,
        "Array schema must have items property",
      );
    });
  });
});
