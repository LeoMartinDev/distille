import type { JSONSchema } from "json-schema-to-ts";

export const schemaJsonSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Schema Validator",
  "description": "JSON Schema to validate Schema objects",
  "definitions": {
    "BaseSchema": {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
      },
    },
    "StringSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": {
              "oneOf": [
                { "const": "string" },
                {
                  "type": "array",
                  "items": { "enum": ["string", "null"] },
                  "minItems": 2,
                  "maxItems": 2,
                },
              ],
            },
            "enum": { "type": "array", "items": { "type": "string" } },
            "format": { "type": "string" },
            "pattern": { "type": "string" },
            "minLength": { "type": "integer", "minimum": 0 },
            "maxLength": { "type": "integer", "minimum": 0 },
          },
          "required": ["type"],
        },
      ],
    },
    "NumberSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": {
              "oneOf": [
                { "const": "number" },
                {
                  "type": "array",
                  "items": { "enum": ["number", "null"] },
                  "minItems": 2,
                  "maxItems": 2,
                },
              ],
            },
            "minimum": { "type": "number" },
            "maximum": { "type": "number" },
            "exclusiveMinimum": { "type": "number" },
            "exclusiveMaximum": { "type": "number" },
            "multipleOf": { "type": "number", "exclusiveMinimum": 0 },
          },
          "required": ["type"],
        },
      ],
    },
    "IntegerSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": {
              "oneOf": [
                { "const": "integer" },
                {
                  "type": "array",
                  "items": { "enum": ["integer", "null"] },
                  "minItems": 2,
                  "maxItems": 2,
                },
              ],
            },
            "minimum": { "type": "number" },
            "maximum": { "type": "number" },
            "exclusiveMinimum": { "type": "number" },
            "exclusiveMaximum": { "type": "number" },
            "multipleOf": { "type": "number", "exclusiveMinimum": 0 },
          },
          "required": ["type"],
        },
      ],
    },
    "BooleanSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": {
              "oneOf": [
                { "const": "boolean" },
                {
                  "type": "array",
                  "items": { "enum": ["boolean", "null"] },
                  "minItems": 2,
                  "maxItems": 2,
                },
              ],
            },
          },
          "required": ["type"],
        },
      ],
    },
    "NullSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": { "const": "null" },
          },
          "required": ["type"],
        },
      ],
    },
    "ArraySchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": {
              "oneOf": [
                { "const": "array" },
                {
                  "type": "array",
                  "items": { "enum": ["array", "null"] },
                  "minItems": 2,
                  "maxItems": 2,
                },
              ],
            },
            "items": { "$ref": "#/definitions/Schema" },
            "minItems": { "type": "integer", "minimum": 0 },
            "maxItems": { "type": "integer", "minimum": 0 },
            "uniqueItems": { "type": "boolean" },
          },
          "required": ["type", "items"],
        },
      ],
    },
    "ObjectSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "type": {
              "oneOf": [
                { "const": "object" },
                {
                  "type": "array",
                  "items": { "enum": ["object", "null"] },
                  "minItems": 2,
                  "maxItems": 2,
                },
              ],
            },
            "properties": {
              "type": "object",
              "additionalProperties": { "$ref": "#/definitions/Schema" },
            },
            "required": {
              "type": "array",
              "items": { "type": "string" },
            },
            "additionalProperties": {
              "oneOf": [
                { "type": "boolean" },
                { "$ref": "#/definitions/Schema" },
              ],
            },
          },
          "required": ["type"],
        },
      ],
    },
    "UnionSchema": {
      "allOf": [
        { "$ref": "#/definitions/BaseSchema" },
        {
          "type": "object",
          "properties": {
            "oneOf": {
              "type": "array",
              "items": { "$ref": "#/definitions/Schema" },
            },
            "anyOf": {
              "type": "array",
              "items": { "$ref": "#/definitions/Schema" },
            },
            "allOf": {
              "type": "array",
              "items": { "$ref": "#/definitions/Schema" },
            },
          },
          "oneOf": [
            { "required": ["oneOf"] },
            { "required": ["anyOf"] },
            { "required": ["allOf"] },
          ],
        },
      ],
    },
    "Schema": {
      "oneOf": [
        { "$ref": "#/definitions/StringSchema" },
        { "$ref": "#/definitions/NumberSchema" },
        { "$ref": "#/definitions/IntegerSchema" },
        { "$ref": "#/definitions/BooleanSchema" },
        { "$ref": "#/definitions/ArraySchema" },
        { "$ref": "#/definitions/ObjectSchema" },
        { "$ref": "#/definitions/NullSchema" },
        { "$ref": "#/definitions/UnionSchema" },
      ],
    },
  },
  "$ref": "#/definitions/Schema",
} as const satisfies JSONSchema;
