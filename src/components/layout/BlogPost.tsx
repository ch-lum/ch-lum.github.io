// import { MDXRemote } from 'next-mdx-remote'
import Link from "next/link";

interface BlogPostProps {
  title: string;
  date: string;
  readingTime: string;
  content: React.ReactNode;
  relatedPosts?: Array<{
    title: string;
    slug: string;
    description: string;
  }>;
}

export default function BlogPost({
  title,
  date,
  readingTime,
  content,
  relatedPosts,
}: BlogPostProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8 animate-[fade-in-down_0.5s_ease-out] opacity-0 [animation-fill-mode:forwards]">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <div className="text-gray-600">
          {date} · {readingTime}
        </div>
      </header>

      <div className="prose lg:prose-lg prose-img:mx-auto animate-[fade-in-down_0.5s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
        {content}
      </div>

      {relatedPosts && relatedPosts.length > 0 && (
        <div className="mt-16 pt-8 border-t animate-[fade-in-down_0.5s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
          <h2 className="text-2xl font-bold mb-6">See More</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block p-6 border rounded-lg hover:border-accent transition-colors"
              >
                <h3 className="font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
