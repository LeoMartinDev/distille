import { pdf } from "../../core/infrastructure/adapters/loader/pdf.loader.ts";
import { makeExtractionService } from "../../core/mod.ts";
import type { Config } from "../config.ts";
import type { Route } from "../types.ts";

export const extractRouteFactory = ({
  config,
}: {
  config: Config;
}): Route => {
  const extractionService = makeExtractionService({
    mistral: config.providers?.mistral,
    openai: config.providers?.openai,
  });

  console.info("Available llms", extractionService.availableModels);

  return {
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
  };
};
