type Post = {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  description: string;
};

const files = import.meta.glob('../../../content/blog/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function parsePost(path: string, raw: string): Post {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
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
    slug: path.split('/').pop()?.replace(/\.mdx$/, '') ?? path,
    title: metadata.title || 'Untitled',
    date: metadata.date,
    readingTime: metadata.readingTime || '',
    description: metadata.description || ''
  };
}

export function load() {
  return {
    posts: Object.entries(files)
      .map(([path, raw]) => parsePost(path, raw))
      .sort((a, b) => b.date.localeCompare(a.date))
  };
}
