# Gemini LLM Adapter

This module provides an adapter for Google's Gemini API to work with our
application's LLM interface.

## Structure

- `gemini.llm.ts` - Main adapter that implements the `Llm` interface for
  Google's Gemini models
- `schema-converter.ts` - Utilities for converting our JSON schema format to
  Gemini's ResponseSchema format
- `gemini-2.0-flash.llm.ts` - Specific implementation for the Gemini 2.0 Flash
  model
- `gemini-2.0-flash-lite.llm.ts` - Specific implementation for the Gemini 2.0
  Flash Lite model

## Features

- Converts complex JSON schemas to Gemini's ResponseSchema format
- Handles nullable types, oneOf/anyOf/allOf composites
- Provides type guard utilities for working with schemas
- Collects token usage statistics

## Testing

The tests use BDD-style testing from the `@std/testing` package.

Then run the tests with:

```bash
deno test packages/core/infrastructure/adapters/llm/gemini
```

## Implementation Details

The adapter uses the `@google/generative-ai` SDK to communicate with the Gemini
API. The main functionality involves:

1. Converting our JSON Schema format to Gemini's ResponseSchema format
2. Sending the API requests with the correct configuration
3. Parsing and validating the responses

### Limitations

Gemini's models structured output schemas have some limitations. Google did not choose to support a subset of JSON Schemas but opted for a select subset of the OpenAPI 3.0 Schema object.

The `schema-converter.ts` module handles the translation between our schema format and Gemini's required format, with support for:

- **Basic types**: Converts primitive types (string, number, boolean, integer) to Gemini's SchemaType equivalents
- **Object schemas**: Transforms object properties and required fields while preserving structure
- **Array schemas**: Preserves array constraints (minItems, maxItems) and converts item schemas
- **Union types**:
  - For `oneOf`/`anyOf` with exactly two schemas where one is null: Converts to the non-null type with `nullable: true`
  - For `oneOf`/`anyOf` with exactly two non-null schemas: Converts to string type with `nullable: false`
  - For other union cases: Converts to string type
  - For `allOf`: Merges properties from all object schemas
- **Nullable handling**:
  - Type arrays with "null" (e.g., `["string", "null"]`): Converts to the primary type with `nullable: true`
  - Union schemas with null option: Converts to the non-null type with `nullable: true`
- **Format preservation**: Maintains format specifications where applicable (e.g., "double" for numbers, "int32" for integers)
- **Enum support**: Preserves enum values for string schemas

This conversion is necessary because Gemini's structured output uses a different schema format than our internal representation, see [Gemini API documentation on structured output](https://ai.google.dev/gemini-api/docs/structured-output?lang=node#json-schemas).
