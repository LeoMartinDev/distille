import { extractText, getResolvedPDFJS } from "unpdf";
import { readFile } from "node:fs/promises";

import { type Loader, makeLoader } from "../../../application/ports/loader.ts";

const pdfFromPath = ({ path }: { path: string }) =>
  makeLoader({
    type: "text",
    load: async () => {
      const fileContent = new Uint8Array(await readFile(path));
      const { getDocument } = await getResolvedPDFJS();
      const document = await getDocument(fileContent).promise;

      const text = await extractText(document);

      return text.text.join("\n");
    },
  });

const pdfFromUint8Array = ({ file }: { file: Uint8Array }) =>
  makeLoader({
    type: "text",
    load: async () => {
      const { getDocument } = await getResolvedPDFJS();
      const document = await getDocument(file).promise;

      const text = await extractText(document);

      return text.text.join("\n");
    },
  });

const pdfFromFile = ({ file }: { file: File }) =>
  makeLoader({
    type: "text",
    load: async () => {
      const { getDocument } = await getResolvedPDFJS();
      const document = await getDocument(await file.arrayBuffer()).promise;

      const text = await extractText(document);

      return text.text.join("\n");
    },
  });

export function pdf({ path }: { path: string }): Loader;
export function pdf({ file }: { file: Uint8Array }): Loader;
export function pdf({ file }: { file: File }): Loader;
export function pdf(
  args: { path: string } | { file: Uint8Array } | { file: File },
) {
  if ("path" in args) {
    return pdfFromPath({ path: args.path });
  } else if ("file" in args && args.file instanceof Uint8Array) {
    return pdfFromUint8Array({ file: args.file });
  } else if ("file" in args && args.file instanceof File) {
    return pdfFromFile({ file: args.file });
  }
}
