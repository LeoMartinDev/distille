import "@std/dotenv/load";

import { makeExtractionService } from "@distille/core";
import { pdf } from "@distille/core/infrastructure/adapters/loader";
import config from "./config.ts";

const extractionService = makeExtractionService({
  mistral: config.providers?.mistral,
  openai: config.providers?.openai,
});

console.info("Available models:", extractionService.availableModels.join(", "));

type Route = {
  method: "GET" | "POST";
  pattern: URLPattern;
  handler: (
    args: { request: Request; params: Record<string, string | undefined> },
  ) => Promise<Response> | Response;
};

const routes: Route[] = [
  {
    method: "POST",
    pattern: new URLPattern({
      pathname: `/api/v1/extract/:model(${
        extractionService.availableModels.join("|")
      })`,
    }),
    handler: async ({ request, params }) => {
      const model = params.model;

      if (!model) {
        return new Response("Bad Request", { status: 400 });
      }

      if (!extractionService.availableModels.includes(model)) {
        return new Response("Not Found", { status: 404 });
      }

      let formData;
      try {
        formData = await request.formData();
      } catch (error) {
        console.error(error);
        return new Response("Missing form data", { status: 400 });
      }

      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return new Response("File is required", { status: 400 });
      }

      if (file.size === 0) {
        return new Response("File is empty", { status: 400 });
      }

      const rawJsonSchema = formData.get("schema");

      if (!rawJsonSchema) {
        return new Response("Schema is required", { status: 400 });
      }

      if (typeof rawJsonSchema !== "string") {
        return new Response("Schema is not a valid JSON schema", {
          status: 400,
        });
      }

      let jsonSchema;
      try {
        const parsedSchema = JSON.parse(rawJsonSchema);
        jsonSchema = parsedSchema;
      } catch (error) {
        console.error(error);
        return new Response("Invalid JSON Schema", { status: 400 });
      }

      const extraction = await extractionService.extract({
        loader: pdf({ file }),
        schema: jsonSchema,
        model,
      });

      return new Response(JSON.stringify(extraction), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
  },
];

export default {
  fetch(request) {
    const matchedRoute = routes.reduce<
      { route: Route; match: URLPatternResult } | undefined
    >((acc, route) => {
      if (route.method === request.method) {
        const match = route.pattern.exec(request.url);

        if (!match) {
          return acc;
        }

        return {
          route,
          match,
        };
      }

      return acc;
    }, undefined);

    if (!matchedRoute) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      const { match, route } = matchedRoute;

      const params = match.pathname.groups;

      return route.handler({ request, params });
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies Deno.ServeDefaultExport;
