import { makeLoader } from "../../../application/ports/loader.ts";

export const text = ({ text }: { text: string }) =>
  makeLoader({
    type: "text",
    load: () => {
      return text;
    },
  });
