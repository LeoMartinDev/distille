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

### Schema Conversion

The `schema-converter.ts` module handles the translation between our schema
format and Gemini's required format, with support for:

- Basic types (string, number, boolean, etc.)
- Object schemas with properties
- Array schemas
- Union types (oneOf, anyOf, allOf)
- Nullable fields
- Type arrays (e.g., ["string", "null"])

This conversion is necessary because Gemini's structured output uses a different
schema format than our internal representation, see
https://ai.google.dev/gemini-api/docs/structured-output?lang=node#json-schemas
