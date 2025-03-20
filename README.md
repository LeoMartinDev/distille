# Distille

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deno](https://img.shields.io/badge/Deno-2.2.x-black?logo=deno)](https://deno.com/)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
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

Here are some examples of what you can do with Distille:

- Extract information from resumes or CVs into structured JSON
- Parse product descriptions from PDFs into database-ready records
- Convert unstructured medical records into standardized fields
- Extract key entities and relationships from legal documents
- Transform meeting notes into actionable items and assignments
- Extract pricing and feature tables from marketing materials

Simply define a JSON Schema for the data you want, provide the unstructured
content, and Distille will handle the extraction process.

## Features

- Works with different LLMs providers (OpenAI, Mistral, Google Gemini)
- Supports different input formats (PDF, text, images, ...)
- Can be used as a library, a CLI or an API
- Schema-driven extraction with JSON Schema
- Type-safe results
- Keeps track of the schema used for extraction
- Guarantees data matches the schema
- Keeps track of the token usage

## Supported LLMs providers

- OpenAI
- Mistral
- [Google Gemini](./packages/core/infrastructure/adapters/llm/gemini/README.md)
  **has limitations, see
  [README](./packages/core/infrastructure/adapters/llm/gemini/README.md#Limitations)**

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

### Prerequisites

- [Deno](https://deno.land/) (version 2 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/distille.git
   cd distille
   ```

2. Install git hooks
   ```
   chmod +x .hooks/setup-hooks.sh
   ./.hooks/setup-hooks.sh
   ```

## Development

### Commit Message Convention

This project follows
[Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

We use the standard `@commitlint/config-conventional` rules via a JSON
configuration file (`.commitlintrc.json`). These rules are enforced
automatically through git hooks.

Examples:

- `feat(core): add new extraction API`
- `fix: correct parsing error in JSON output`
- `docs: update installation instructions`

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

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

##### Deno

```ts
import { makeExtractionService } from "jsr:distille";
```

You can install it as a dependency:

```bash
deno add jsr:distille
```

##### Node.js

```bash
npx jsr add distille
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
