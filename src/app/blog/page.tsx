import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";

export default async function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 animate-fade-in-down">Blog</h1>

      <div className="space-y-8">
        {posts.map((post, index) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.slug}
            className="block group animate-[fade-in-down_0.5s_ease-out] [animation-delay:var(--delay)] opacity-0 [animation-fill-mode:forwards]"
            style={
              { "--delay": `${(index + 1) * 0.1}s` } as React.CSSProperties
            }
          >
            <article className="border rounded-lg p-6 hover:border-accent/40 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{post.title}</h2>
                <div className="text-sm text-gray-500">{post.readingTime}</div>
              </div>
              <p className="text-gray-600 mb-4">{post.description}</p>
              <div className="text-sm text-gray-500">{post.date}</div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
