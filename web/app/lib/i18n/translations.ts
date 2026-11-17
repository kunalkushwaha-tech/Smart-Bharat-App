import en from "./en";
import hi from "./hi";
import mr from "./mr";
import type { Translation } from "./index";

export type Language = "en" | "hi" | "mr";
export const translations: Record<Language, Translation> = { en, hi, mr };
