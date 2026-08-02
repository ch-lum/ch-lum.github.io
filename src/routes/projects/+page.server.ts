type Project = {
  title: string;
  description: string;
  link: string;
  image: string;
  tags: string[];
};

const projectFile = import.meta.glob('../../../content/projects.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

function parseProjects(raw: string): Project[] {
  return raw.split(/^## /m).slice(1).map((section) => {
    const [titleLine, ...lines] = section.trim().split(/\r?\n/);
    const fields = Object.fromEntries(lines
      .filter((line) => /^- (Link|Image|Tags): /.test(line))
      .map((line) => {
        const separator = line.indexOf(':');
        return [line.slice(2, separator), line.slice(separator + 1).trim()];
      }));
    const description = lines
      .filter((line) => line.trim() && !line.startsWith('- Link:') && !line.startsWith('- Image:') && !line.startsWith('- Tags:'))
      .join(' ');

    return {
      title: titleLine.trim(),
      description,
      link: fields.Link || '#',
      image: fields.Image || '',
      tags: (fields.Tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
    };
  });
}

export function load() {
  return { projects: parseProjects(Object.values(projectFile)[0] || '') };
}
