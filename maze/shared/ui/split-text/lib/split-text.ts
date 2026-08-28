export type SplitMode = "chars" | "words";

export function splitText(text: string, mode: SplitMode): string[] {
  if (mode === "words") {
    return text.split(/\s+/).filter(Boolean);
  }
  return [...text];
}
