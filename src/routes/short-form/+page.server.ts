type Entry = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  medium: 'text' | 'image';
  image?: string;
  body: string;
};

const files = import.meta.glob('../../../content/short-form/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function parseEntry(path: string, raw: string): Entry {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${path} needs a frontmatter block.`);

  const metadata = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(':');
    if (separator < 0) throw new Error(`Invalid frontmatter line in ${path}: ${line}`);
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  const medium = metadata.medium === 'image' ? 'image' : 'text';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) throw new Error(`${path} needs a YYYY-MM-DD date.`);
  if (medium === 'image' && !metadata.image) throw new Error(`${path} needs an image path.`);

  return {
    slug: path.split('/').pop()?.replace(/\.md$/, '') ?? path,
    title: metadata.title || 'Untitled',
    date: metadata.date,
    tags: (metadata.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    medium,
    image: metadata.image,
    body: match[2].trim()
  };
}

export function load() {
  const entries = Object.entries(files)
    .map(([path, raw]) => parseEntry(path, raw))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { entries };
}
