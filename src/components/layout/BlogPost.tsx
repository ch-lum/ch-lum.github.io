// import { MDXRemote } from 'next-mdx-remote'

interface BlogPostProps {
  title: string;
  date: string;
  readingTime: string;
  content: React.ReactNode;
}

export default function BlogPost({ title, date, readingTime, content }: BlogPostProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <div className="text-gray-600">{date} · {readingTime}</div>
      </header>

      <div className="prose lg:prose-lg prose-img:mx-auto">
        {content}
      </div>
    </article>
  )
} 