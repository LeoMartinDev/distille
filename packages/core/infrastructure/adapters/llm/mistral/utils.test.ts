import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  getDataFromResponse,
  type MistralResponse,
  toMistralAiMessages,
} from "./utils.ts";

const makeChoices = (
  message: NonNullable<MistralResponse["choices"]>[number]["message"],
): NonNullable<MistralResponse["choices"]> => [
  {
    message,
    index: 0,
    finishReason: "stop",
  },
];

const makeResponse = (
  choices: MistralResponse["choices"],
): MistralResponse => ({
  choices,
  id: "id",
  object: "object",
  model: "model",
  usage: {
    promptTokens: 1,
    completionTokens: 1,
    totalTokens: 1,
  },
});

describe("toMistralAiMessages", () => {
  describe("When the model does not support vision", () => {
    it("converts system text messages", () => {
      const result = toMistralAiMessages({ vision: false }, [{
        role: "system",
        content: {
          text: "Hello, world!",
          type: "text",
        },
      }]);

      expect(result).toEqual([
        {
          role: "system",
          content: "Hello, world!",
        },
      ]);
    });

    it("converts assistant text messages", () => {
      const result = toMistralAiMessages({ vision: false }, [{
        role: "assistant",
        content: {
          text: "Hello, world!",
          type: "text",
        },
      }]);

      expect(result).toEqual([
        {
          role: "assistant",
          content: "Hello, world!",
        },
      ]);
    });

    it("converts user text messages", () => {
      const result = toMistralAiMessages({ vision: false }, [{
        role: "user",
        content: {
          text: "Hello, world!",
          type: "text",
        },
      }]);

      expect(result).toEqual([
        {
          role: "user",
          content: "Hello, world!",
        },
      ]);
    });

    it("throws an error if the message is not a text message", () => {
      expect(() =>
        toMistralAiMessages({ vision: false }, [{
          role: "user",
          content: {
            type: "vision",
            text: "Hello, world!",
            image: "https://example.com/image.png",
          },
        }])
      ).toThrow();
    });

    it("throws an error if the role is not supported", () => {
      expect(() =>
        toMistralAiMessages({ vision: false }, [{
          role: "unknown" as unknown as "user",
          content: {
            text: "Hello, world!",
            type: "text",
          },
        }])
      ).toThrow();
    });
  });

  describe("When the model supports vision", () => {
    it("converts user text and vision messages", () => {
      const result = toMistralAiMessages({ vision: true }, [{
        role: "user",
        content: {
          type: "vision",
          text: "Hello, world!",
          image: "https://example.com/image.png",
        },
      }]);

      expect(result).toEqual([
        {
          role: "user",
          content: [
            { type: "text", text: "Hello, world!" },
            {
              type: "image_url",
              imageUrl: { url: "https://example.com/image.png" },
            },
          ],
        },
      ]);
    });
  });
});

describe("getDataFromResponse", () => {
  it("It may happen that the LLM response is empty", () => {
    expect(getDataFromResponse({
      schema: {},
      response: makeResponse(undefined),
    })).toBeNull();

    expect(getDataFromResponse({
      schema: {},
      response: makeResponse([]),
    })).toBeNull();

    expect(getDataFromResponse({
      schema: {},
      response: makeResponse(makeChoices({ content: undefined })),
    })).toBeNull();
  });

  it("It may happen that the LLM response content is an array of ContentChunk which we don't support", () => {
    expect(getDataFromResponse({
      schema: {},
      response: makeResponse(
        makeChoices({
          content: [{ type: "text", text: "Hello, world!" }],
        }),
      ),
    })).toBeNull();
  });

  it("It may happen that the response content is not a valid JSON string", () => {
    expect(getDataFromResponse({
      schema: {},
      response: makeResponse(makeChoices({ content: "{ key: value" })),
    })).toBeNull();
  });

  it("A string response is a valid response", () => {
    expect(getDataFromResponse({
      schema: {
        type: "string",
        description: "A string response",
      },
      response: makeResponse(makeChoices({ content: "Hello, world!" })),
    })).toBe("Hello, world!");
  });

  it("We ensure the response content is valid for the schema", () => {
    expect(getDataFromResponse({
      schema: {
        type: "object",
      },
      response: makeResponse(makeChoices({ content: "Hello, world!" })),
    })).toBeNull();

    expect(getDataFromResponse({
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
        required: ["name"],
      },
      response: makeResponse(makeChoices({ content: '{"name": "John"}' })),
    })).toEqual({ name: "John" });

    expect(getDataFromResponse({
      schema: {
        type: "object",
        properties: {
          age: {
            type: "number",
          },
        },
        required: ["age"],
      },
      response: makeResponse(makeChoices({ content: '{"age": "18"}' })),
    })).toBeNull();
  });
});
