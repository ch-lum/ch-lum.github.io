export type LongFormPost = {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  description: string;
  body: string;
};

const files = import.meta.glob('../../../content/long-form/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function parsePost(path: string, raw: string): LongFormPost {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${path} needs a frontmatter block.`);

  const frontmatter = match[1]
    .replace(/\r?\n(?=[A-Za-z][A-Za-z0-9]*:)/g, '\u0000')
    .split('\u0000')
    .filter(Boolean);
  const metadata = Object.fromEntries(frontmatter.map((field) => {
    const separator = field.indexOf(':');
    const key = field.slice(0, separator).trim();
    const value = field.slice(separator + 1).trim().replace(/^(['"])([\s\S]*)\1$/, '$2').replace(/\r?\n/g, ' ');
    return [key, value];
  }));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) throw new Error(`${path} needs a YYYY-MM-DD date.`);

  return {
    slug: path.split('/').pop()?.replace(/\.md$/, '') ?? path,
    title: metadata.title || 'Untitled',
    date: metadata.date,
    readingTime: metadata.readingTime || '',
    description: metadata.description || '',
    body: match[2].trim()
  };
}

export const longFormPosts = Object.entries(files)
  .map(([path, raw]) => parsePost(path, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

function inlineMarkdown(value: string) {
  return value
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>');
}

export function renderMarkdown(markdown: string) {
  const blocks = markdown.split(/\r?\n\s*\r?\n/);

  return blocks.map((block) => {
    const trimmed = block.trim();
    if (/^<img\s[\s\S]*\/?\s*>$/.test(trimmed)) return trimmed;

    const heading = trimmed.match(/^(#{2,4})\s+([\s\S]+)$/);
    if (heading) return `<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`;

    const lines = trimmed.split(/\r?\n/);
    if (lines.every((line) => /^-\s+/.test(line))) {
      return `<ul>${lines.map((line) => `<li>${inlineMarkdown(line.replace(/^-\s+/, ''))}</li>`).join('')}</ul>`;
    }
    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      return `<ol>${lines.map((line) => `<li>${inlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
    }

    return `<p>${inlineMarkdown(lines.join(' '))}</p>`;
  }).join('').replaceAll('</ol><ol>', '').replaceAll('</ul><ul>', '');
}
