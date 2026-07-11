/**
 * Count readable words in Markdown content.
 *
 * Han characters count individually. Remaining letter and number sequences
 * count as words. Code, URLs, and Markdown syntax are excluded from the total.
 */
export function countContentWords(markdown: string): number {
  const readableText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*\[[^\]]+\]:\s+\S+.*$/gm, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[\\#>*_~|()[\]{}-]/g, " ");

  const hanCharacters = readableText.match(/\p{Script=Han}/gu)?.length ?? 0;
  const nonHanText = readableText.replace(/\p{Script=Han}/gu, " ");
  const words =
    nonHanText.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;

  return hanCharacters + words;
}
