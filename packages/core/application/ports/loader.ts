export type TextLoader = {
  type: "text";
  // promise or not
  load: () => Promise<string> | string;
};

export type Loader = TextLoader;

type LoaderType = Loader["type"];

export const makeLoader = <
  Type extends LoaderType,
>(
  { type, load }: { type: Type; load: Extract<Loader, { type: Type }>["load"] },
): Extract<Loader, { type: Type }> => {
  if (type === "text") {
    return {
      type,
      load,
    } as Extract<Loader, { type: Type }>;
  }

  throw new Error(`Unsupported loader type: ${type}`);
};
