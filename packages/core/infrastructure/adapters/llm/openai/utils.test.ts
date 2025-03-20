import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { toOpenAiMessages } from "./utils.ts";

describe("toOpenAiMessages", () => {
  describe("When vision is not supported", () => {
    it("should convert a system message to an OpenAI message", () => {
      expect(toOpenAiMessages({ vision: false }, [
        {
          role: "system",
          content: {
            type: "text",
            text: "Hello, world!",
          },
        },
      ])).toEqual([
        { role: "system", content: "Hello, world!" },
      ]);
    });

    it("should convert a user message to an OpenAI message", () => {
      expect(toOpenAiMessages({ vision: false }, [
        {
          role: "user",
          content: {
            type: "text",
            text: "Hello, world!",
          },
        },
      ])).toEqual([
        { role: "user", content: "Hello, world!" },
      ]);
    });

    it("should convert an assistant message to an OpenAI message", () => {
      expect(toOpenAiMessages({ vision: false }, [
        {
          role: "assistant",
          content: {
            type: "text",
            text: "Hello, world!",
          },
        },
      ])).toEqual([
        { role: "assistant", content: "Hello, world!" },
      ]);
    });
  });

  describe("When vision is supported", () => {
    it("should convert a user message to an OpenAI message", () => {
      expect(toOpenAiMessages({ vision: true }, [
        {
          role: "user",
          content: {
            type: "vision",
            image: "https://example.com/image.png",
          },
        },
      ])).toEqual([
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: "https://example.com/image.png" },
            },
          ],
        },
      ]);

      expect(toOpenAiMessages({ vision: true }, [
        {
          role: "user",
          content: {
            type: "vision",
            text: "Hello, world!",
            image: "https://example.com/image.png",
          },
        },
      ])).toEqual([
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Hello, world!",
            },
            {
              type: "image_url",
              image_url: { url: "https://example.com/image.png" },
            },
          ],
        },
      ]);
    });
  });
});
