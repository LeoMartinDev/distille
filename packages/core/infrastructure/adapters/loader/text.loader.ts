import {
  makeLoader,
  type TextLoader,
} from "../../../application/ports/loader.ts";

export const text = ({ text }: { text: string }): TextLoader =>
  makeLoader({
    type: "text",
    load: () => {
      return text;
    },
  });
