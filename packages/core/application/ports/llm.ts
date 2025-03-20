import type { SerializableJSON } from "../../domain/utils/types.ts";
import type { Schema } from "../../domain/entities/extraction.entity.ts";

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
  text?: string;
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

type UserMessage = {
  role: "user";
  content: VisionContent | TextContent;
};

export function isVisionContent(
  content: TextContent | VisionContent,
): content is VisionContent {
  return content?.type === "vision" && typeof content.image === "string";
}

export type Message =
  | SystemMessage
  | AssistantMessage
  | UserMessage;

export type Llm = {
  parse({
    schema,
    messages,
  }: {
    schema: Schema;
    messages: Message[];
  }): Promise<{
    data: SerializableJSON | null;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    schema: Schema;
  }>;
  readonly model: string;
  readonly features: Features;
};
