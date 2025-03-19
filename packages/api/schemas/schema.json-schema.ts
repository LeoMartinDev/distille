import type { JSONSchema } from "json-schema-to-ts";

export const schemaJsonSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Extraction Schema",
  "description": "Schema that validates our custom Schema type",
  "oneOf": [
    {
      "type": "object",
      "properties": {
        "type": {
          "oneOf": [
            { "const": "string" },
            {
              "type": "array",
              "items": [
                { "const": "string" },
                { "const": "null" },
              ],
              "additionalItems": false,
              "minItems": 2,
              "maxItems": 2,
            },
          ],
        },
        "description": { "type": "string" },
        "enum": {
          "type": "array",
          "items": { "type": "string" },
        },
        "format": { "type": "string" },
        "pattern": { "type": "string" },
        "minLength": { "type": "integer", "minimum": 0 },
        "maxLength": { "type": "integer", "minimum": 0 },
      },
      "required": ["type"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "oneOf": [
            { "const": "number" },
            {
              "type": "array",
              "items": [
                { "const": "number" },
                { "const": "null" },
              ],
              "additionalItems": false,
              "minItems": 2,
              "maxItems": 2,
            },
          ],
        },
        "description": { "type": "string" },
        "minimum": { "type": "number" },
        "maximum": { "type": "number" },
        "exclusiveMinimum": { "type": "number" },
        "exclusiveMaximum": { "type": "number" },
        "multipleOf": { "type": "number", "exclusiveMinimum": 0 },
      },
      "required": ["type"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "oneOf": [
            { "const": "integer" },
            {
              "type": "array",
              "items": [
                { "const": "integer" },
                { "const": "null" },
              ],
              "additionalItems": false,
              "minItems": 2,
              "maxItems": 2,
            },
          ],
        },
        "description": { "type": "string" },
        "minimum": { "type": "integer" },
        "maximum": { "type": "integer" },
        "exclusiveMinimum": { "type": "integer" },
        "exclusiveMaximum": { "type": "integer" },
        "multipleOf": { "type": "integer", "minimum": 1 },
      },
      "required": ["type"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "oneOf": [
            { "const": "boolean" },
            {
              "type": "array",
              "items": [
                { "const": "boolean" },
                { "const": "null" },
              ],
              "additionalItems": false,
              "minItems": 2,
              "maxItems": 2,
            },
          ],
        },
        "description": { "type": "string" },
      },
      "required": ["type"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "oneOf": [
            { "const": "array" },
            {
              "type": "array",
              "items": [
                { "const": "array" },
                { "const": "null" },
              ],
              "additionalItems": false,
              "minItems": 2,
              "maxItems": 2,
            },
          ],
        },
        "description": { "type": "string" },
        "items": { "$ref": "#" },
        "minItems": { "type": "integer", "minimum": 0 },
        "maxItems": { "type": "integer", "minimum": 0 },
        "uniqueItems": { "type": "boolean" },
      },
      "required": ["type", "items"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "type": {
          "oneOf": [
            { "const": "object" },
            {
              "type": "array",
              "items": [
                { "const": "object" },
                { "const": "null" },
              ],
              "additionalItems": false,
              "minItems": 2,
              "maxItems": 2,
            },
          ],
        },
        "description": { "type": "string" },
        "properties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
        },
        "required": {
          "type": "array",
          "items": { "type": "string" },
        },
        "additionalProperties": {
          "oneOf": [
            { "type": "boolean" },
            { "$ref": "#" },
          ],
        },
      },
      "required": ["type"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "type": { "const": "null" },
        "description": { "type": "string" },
      },
      "required": ["type"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
        "oneOf": {
          "type": "array",
          "items": { "$ref": "#" },
          "minItems": 1,
        },
      },
      "required": ["oneOf"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
        "anyOf": {
          "type": "array",
          "items": { "$ref": "#" },
          "minItems": 1,
        },
      },
      "required": ["anyOf"],
      "additionalProperties": false,
    },
    {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
        "allOf": {
          "type": "array",
          "items": { "$ref": "#" },
          "minItems": 1,
        },
      },
      "required": ["allOf"],
      "additionalProperties": false,
    },
  ],
} as const satisfies JSONSchema;
