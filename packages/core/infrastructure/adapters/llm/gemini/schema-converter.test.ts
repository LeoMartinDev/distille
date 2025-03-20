import { expect } from "@std/expect";
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
  IntegerSchema,
  NullSchema,
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

      expect(isStringSchema(stringSchema)).toBe(true);
      expect(isStringSchema(nullableStringSchema)).toBe(true);
      expect(isStringSchema(numberSchema)).toBe(false);
    });
  });

  describe("isArraySchema", () => {
    it("identifies array schemas correctly", () => {
      const arraySchema: ArraySchema = {
        type: "array",
        items: { type: "string" },
      };
      const nullableArraySchema: ArraySchema = {
        type: ["array", "null"],
        items: { type: "string" },
      };
      const stringSchema: StringSchema = { type: "string" };

      expect(isArraySchema(arraySchema)).toBe(true);
      expect(isArraySchema(nullableArraySchema)).toBe(true);
      expect(isArraySchema(stringSchema)).toBe(false);
    });
  });

  describe("isBooleanSchema", () => {
    it("identifies boolean schemas correctly", () => {
      const booleanSchema: BooleanSchema = { type: "boolean" };
      const nullableBooleanSchema: BooleanSchema = {
        type: ["boolean", "null"],
      };
      const numberSchema: NumberSchema = { type: "number" };

      expect(isBooleanSchema(booleanSchema)).toBe(true);
      expect(isBooleanSchema(nullableBooleanSchema)).toBe(true);
      expect(isBooleanSchema(numberSchema)).toBe(false);
    });
  });

  describe("isIntegerSchema", () => {
    it("identifies integer schemas correctly", () => {
      const integerSchema: IntegerSchema = { type: "integer" };
      const nullableIntegerSchema: IntegerSchema = {
        type: ["integer", "null"],
      };
      const numberSchema: NumberSchema = { type: "number" };

      expect(isIntegerSchema(integerSchema)).toBe(true);
      expect(isIntegerSchema(nullableIntegerSchema)).toBe(true);
      expect(isIntegerSchema(numberSchema)).toBe(false);
    });
  });

  describe("isNullSchema", () => {
    it("identifies null schemas correctly", () => {
      const nullSchema: NullSchema = { type: "null" };
      const numberSchema: NumberSchema = { type: "number" };

      expect(isNullSchema(nullSchema)).toBe(true);
      expect(isNullSchema(numberSchema)).toBe(false);
    });
  });

  describe("isNumberSchema", () => {
    it("identifies number schemas correctly", () => {
      const numberSchema: NumberSchema = { type: "number" };
      const nullableNumberSchema: NumberSchema = { type: ["number", "null"] };
      const stringSchema: StringSchema = { type: "string" };

      expect(isNumberSchema(numberSchema)).toBe(true);
      expect(isNumberSchema(nullableNumberSchema)).toBe(true);
      expect(isNumberSchema(stringSchema)).toBe(false);
    });
  });

  describe("isObjectSchema", () => {
    it("identifies object schemas correctly", () => {
      const objectSchema: ObjectSchema = { type: "object" };
      const nullableObjectSchema: ObjectSchema = { type: ["object", "null"] };
      const numberSchema: NumberSchema = { type: "number" };

      expect(isObjectSchema(objectSchema)).toBe(true);
      expect(isObjectSchema(nullableObjectSchema)).toBe(true);
      expect(isObjectSchema(numberSchema)).toBe(false);
    });
  });

  describe("isUnionSchema", () => {
    it("identifies union schemas correctly", () => {
      const unionSchema: UnionSchema = {
        oneOf: [{ type: "string" }, { type: "number" }],
      };
      const nullableUnionSchema: UnionSchema = {
        oneOf: [{ type: "string" }, { type: "number" }, { type: "null" }],
      };
      const objectSchema: ObjectSchema = { type: "object" };

      expect(isUnionSchema(unionSchema)).toBe(true);
      expect(isUnionSchema(nullableUnionSchema)).toBe(true);
      expect(isUnionSchema(objectSchema)).toBe(false);
    });
  });

  describe("hasTypeArray", () => {
    it("detects array type definitions", () => {
      const simpleSchema: StringSchema = { type: "string" };
      const arrayTypeSchema: Schema = { type: ["string", "null"] };

      expect(hasTypeArray(simpleSchema)).toBe(false);
      expect(hasTypeArray(arrayTypeSchema)).toBe(true);
    });
  });

  describe("getSchemaType", () => {
    it("returns the primary type from a schema", () => {
      const stringSchema: StringSchema = { type: "string" };
      const nullableNumberSchema: NumberSchema = { type: ["number", "null"] };

      expect(getSchemaType(stringSchema)).toBe("string");
      expect(getSchemaType(nullableNumberSchema)).toBe("number");
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

      expect(result.type).toBe(SchemaType.STRING);
      expect(result.description).toBe("A test string");
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
      expect(typedResult.type).toBe(SchemaType.NUMBER);
      expect(typedResult.format).toBe("double");
      expect(typedResult.description).toBe("A test number");
    });

    it("converts boolean schema correctly", () => {
      const boolSchema: BooleanSchema = {
        type: "boolean",
        description: "A test boolean",
      };

      const result = convertToGeminiSchema(boolSchema);

      expect(result.type).toBe(SchemaType.BOOLEAN);
      expect(result.description).toBe("A test boolean");
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
        items?: {
          type: string;
          description?: string;
        };
      };

      expect(typedResult.type).toBe(SchemaType.ARRAY);
      expect(typedResult.description).toBe("A test array");
      expect(typedResult.minItems).toBe(1);
      expect(typedResult.maxItems).toBe(10);
      expect(typedResult.items?.type).toBe(SchemaType.STRING);
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
        properties?: Record<string, {
          type: string;
          description?: string;
          format?: string;
          nullable?: boolean;
        }>;
      };

      expect(typedResult.type).toBe(SchemaType.OBJECT);
      expect(typedResult.description).toBe("A test object");
      expect(typedResult.required).toEqual(["name"]);
      expect(typedResult.properties?.name.type).toBe(SchemaType.STRING);
      expect(typedResult.properties?.age.type).toBe(SchemaType.INTEGER);
    });

    it("handles nullable types", () => {
      const nullableSchema: StringSchema = {
        type: ["string", "null"],
        description: "A nullable string",
      };

      const result = convertToGeminiSchema(nullableSchema);

      expect(result.type).toBe(SchemaType.STRING);
      expect(result.description).toBe("A nullable string");
      expect(result.nullable).toBe(true);
    });

    it("type is converted as is when union schema has two types including a null type", () => {
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

      expect(typedResult.type).toBe(SchemaType.STRING);
      expect(typedResult.nullable).toBe(true);
    });

    it("type is converted as string when union schema has two types and no null type", () => {
      const unionSchema: UnionSchema = {
        oneOf: [
          { type: "string" },
          { type: "number" },
        ],
        description: "A string or number",
      };

      const result = convertToGeminiSchema(unionSchema);

      // Type assertion for nullable property
      const typedResult = result as {
        type: string;
        nullable?: boolean;
      };

      expect(typedResult.type).toBe(SchemaType.STRING);
      expect(typedResult.nullable).toBe(false);
    });

    it("type is always string when union schema has more than one type", () => {
      const unionSchema: UnionSchema = {
        oneOf: [
          { type: "array", items: { type: "string" } },
          { type: "number" },
          { type: "boolean" },
        ],
        description: "A mixed type",
      };

      const result = convertToGeminiSchema(unionSchema);

      expect(result.type).toBe(SchemaType.STRING);
    });

    it("throws for array schema without items", () => {
      const badArraySchema = {
        type: "array",
        description: "Bad array without items",
      } as ArraySchema;

      expect(() => convertToGeminiSchema(badArraySchema)).toThrow(
        "Array schema must have items property",
      );
    });
  });
});
