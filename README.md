# Distille

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deno](https://img.shields.io/badge/Deno-2.2.x-black?logo=deno)](https://deno.com/)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
  - [API](#api)
    - [Docker Deployment](#with-docker)
    - [Local Development](#locally)
    - [API Endpoints](#api-endpoints)
  - [Library](#library)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

Distille is a tool for extracting structured data from unstructured text by
leveraging the power of LLMs.

## Features

- Works with different LLMs providers (OpenAI, Mistral, Google Gemini)
- Supports different input formats (PDF, text, images, ...)
- Can be used as a library, a CLI or an API
- Schema-driven extraction with JSON Schema
- Type-safe results

## Configuration

Distille requires API keys for at least one of the supported LLM providers:

- OpenAI
- Mistral
- Google Gemini

You can obtain these API keys from their respective platforms:

- OpenAI: https://platform.openai.com/api-keys
- Mistral: https://console.mistral.ai/
- Google Gemini: https://ai.google.dev/

## Getting Started

### API

#### With Docker

```bash
docker run -d \
  -p 8000:8000 \
  -e GEMINI_API_KEY=<your-gemini-api-key> \
  -e OPENAI_API_KEY=<your-openai-api-key> \
  -e MISTRAL_API_KEY=<your-mistral-api-key> \
  -e TOKEN=<your-token> \
  ghcr.io/distille-ai/distille:latest
```

You must provide at least one of the following environment variables:

- `GEMINI_API_KEY`: Google Gemini API key
- `OPENAI_API_KEY`: OpenAI API key
- `MISTRAL_API_KEY`: Mistral API key

You can also provide the following optional environment variables:

- `TOKEN`: A token to secure the API calls, must be provided in the
  `Authorization` header with the prefix, e.g: `Authorization: <your-token>`

#### Locally

Distille requires Deno `2.2.x`: https://deno.com/

Configuration is done via environment variables, you can set them in a `.env`
file in the `packages/api` directory:

```
MISTRAL_API_KEY=your-mistral-api-key
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

TOKEN=your-token
```

To run it locally, you can use the following command:

```bash
cd packages/api
deno run -A main.ts
```

#### API Endpoints

The API exposes endpoints for extracting structured data from files.

##### Extract Endpoint

```
POST /api/v1/extract/:model
```

Parameters:

- `:model` - The LLM model to use (one of the available models from your
  configured providers)

Headers:

- `Authorization: <your-token>` - If TOKEN is configured

Body (form-data):

- `file` - The file to extract data from (PDF, text, etc.)
- `schema` - JSON Schema defining the structure to extract

Example using curl:

```bash
curl -X POST \
  http://localhost:8000/api/v1/extract/mistral-large \
  -H 'Authorization: your-token' \
  -F 'file=@document.pdf' \
  -F 'schema={"type":"object","properties":{"title":{"type":"string"},"date":{"type":"string"}}}'
```

### Library

Distille can be used as a library in your Deno or Node.js projects.

#### Installation

For Deno:

```ts
import { makeExtractionService } from "https://deno.land/x/distille/mod.ts";
```

For Node.js (coming soon):

```bash
npm install distille
```

#### Usage Example

```ts
import { makeExtractionService } from "distille";

// Initialize the extraction service with your API keys
const extractionService = makeExtractionService({
  mistral: { apiKey: "your-mistral-api-key" },
  openai: { apiKey: "your-openai-api-key" },
});

// Extract structured data from text
const result = await extractionService.extract({
  content: "Your unstructured text goes here",
  schema: {
    // Define the schema for the data you want to extract
    type: "object",
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      date: { type: "string" },
    },
    required: ["title", "author"],
  },
});

console.log(result);
```

## Examples

### Extracting Contact Information from Text

```ts
const result = await extractionService.extract({
  content: `
    John Doe
    Software Engineer
    Email: john.doe@example.com
    Phone: (555) 123-4567
    Address: 123 Main St, Anytown, CA 12345
  `,
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      occupation: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      address: { type: "string" },
    },
  },
});
```

### Extracting Data from PDF

```ts
import { mistralLarge } from "distille/infrastructure/adapters/llm";
import { pdf } from "distille/infrastructure/adapters/loader";
import { extractionServiceFactory } from "distille/core";

const extractionService = extractionServiceFactory({
  llms: [mistralLarge({ apiKey: Deno.env.get("MISTRAL_API_KEY") })],
});

const result = await extractionService.extract({
  loader: pdf({ file: pdfFile }),
  schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      author: { type: "string" },
      date: { type: "string" },
    },
  },
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
