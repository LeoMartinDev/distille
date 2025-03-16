import { Extraction } from "../../domain/entities/extraction.entity.ts";

export type ExtractionRepository = {
  save: (args: { extraction: Extraction }) => Promise<void>;
};
