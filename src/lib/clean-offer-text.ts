const STAR_PATTERN = /[★☆⭐✭✮✯✰]/g;

export function cleanSubtitle(text: string): string {
  return text.replace(STAR_PATTERN, "").replace(/\s+/g, " ").trim();
}
