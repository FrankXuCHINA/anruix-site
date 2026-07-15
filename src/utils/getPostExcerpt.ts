const isThematicBreak = (line: string) =>
  /^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line);

const isTableDivider = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed.includes("-")) return false;

  const cells = trimmed.replace(/^\||\|$/g, "").split("|");
  return (
    cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell.trim()))
  );
};

const isNonParagraphBlock = (line: string) =>
  /^(?: {4}|\t| {0,3}(?:#{1,6}(?:\s|$)|>|(?:[-+*]|\d+[.)])\s+|<\/?[A-Za-z][^>]*>|:::|(?:import|export)\s))/.test(
    line
  ) ||
  /^ {0,3}\[[^\]]+\]:\s+/.test(line) ||
  /^ {0,3}!\[[^\]]*\]\([^)]*\)\s*$/.test(line) ||
  isThematicBreak(line);

const stripInlineMarkdown = (value: string) =>
  value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/\[\^[^\]]+\]/g, " ")
    .replace(/<((?:https?:\/\/|mailto:)[^>]+)>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[\*_~]/g, "")
    .replace(/\\([\\`*{}[\]()#+\-.!_>])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Return the first readable paragraph from a Markdown post.
 *
 * Headings, lists, quotes, tables, code fences, HTML blocks, and image-only
 * paragraphs are skipped so the result matches the first prose paragraph that
 * appears in the rendered article. The frontmatter description remains a
 * fallback for posts without a readable paragraph.
 */
export function getPostExcerpt(markdown: string, fallback = ""): string {
  const lines = markdown
    .replace(/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  let paragraph: string[] = [];
  let fenceCharacter = "";
  let fenceLength = 0;
  let skippingTable = false;

  const readParagraph = () => stripInlineMarkdown(paragraph.join(" "));

  for (const line of lines) {
    const trimmed = line.trim();
    const fence = trimmed.match(/^(`{3,}|~{3,})/);

    if (fenceCharacter) {
      if (
        fence &&
        fence[1][0] === fenceCharacter &&
        fence[1].length >= fenceLength
      ) {
        fenceCharacter = "";
        fenceLength = 0;
      }
      continue;
    }

    if (fence) {
      const excerpt = readParagraph();
      if (excerpt) return excerpt;
      paragraph = [];
      fenceCharacter = fence[1][0];
      fenceLength = fence[1].length;
      continue;
    }

    if (!trimmed) {
      const excerpt = readParagraph();
      if (excerpt) return excerpt;
      paragraph = [];
      skippingTable = false;
      continue;
    }

    if (skippingTable) {
      if (trimmed.includes("|")) continue;
      skippingTable = false;
    }

    if (isTableDivider(line)) {
      paragraph = [];
      skippingTable = true;
      continue;
    }

    if (/^ {0,3}(?:=+|-+)\s*$/.test(line) && paragraph.length) {
      paragraph = [];
      continue;
    }

    if (isNonParagraphBlock(line)) {
      const excerpt = readParagraph();
      if (excerpt) return excerpt;
      paragraph = [];
      continue;
    }

    paragraph.push(trimmed);
  }

  return readParagraph() || fallback.trim();
}
