/**
 * Converts a post slug into a collision-free CSS custom identifier fragment.
 * Encoding every UTF-8 byte keeps nested and non-ASCII slugs deterministic.
 */
export function getPostTransitionKey(slug: string): string {
  const bytes = new TextEncoder().encode(slug.normalize("NFC"));
  const encodedSlug = Array.from(bytes, byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  return `post-${encodedSlug}`;
}
