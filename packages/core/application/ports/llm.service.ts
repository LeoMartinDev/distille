import type { JSONSchema } from "json-schema-to-ts";
import type { SerializableJSON } from "../../domain/utils/types.ts";

export type Features = {
  vision: boolean;
  // other features...
};

type TextContent = {
  type: "text";
  text: string;
};

export type VisionContent = {
  type: "vision";
  text: string;
  image: string;
};

type SystemMessage = {
  role: "system";
  content: TextContent;
};

type AssistantMessage = {
  role: "assistant";
  content: TextContent;
};

type UserMessage<F extends Features> = {
  role: "user";
  content: F extends { vision: true } ? (VisionContent | TextContent)
    : TextContent;
};

export function isVisionContent(
  content: TextContent | VisionContent,
): content is VisionContent {
  return content?.type === "vision" && typeof content.image === "string";
}

export type Message<F extends Features = Features> =
  | SystemMessage
  | AssistantMessage
  | UserMessage<F>;

export type Llm = {
  parse({
    schema,
    messages,
  }: {
    schema: JSONSchema;
    messages: Message[];
  }): Promise<{
    data: SerializableJSON | null;
  }>;
  readonly model: string;
  readonly features: Features;
};
