export function customerFirstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "viajero";
  const first = trimmed.split(/\s+/)[0] ?? trimmed;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
