import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { compileMDX } from "next-mdx-remote/rsc";
import BlogPost from "@/components/layout/BlogPost";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage(props: Props) {
  const { slug } = await props.params;
  const post = getPostBySlug(slug);
  const allPosts = getAllPosts();

  // Get 2 random posts that aren't the current post
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((p) => ({
      title: p.title,
      slug: p.slug,
      description: p.description,
    }));

  const { content } = await compileMDX({
    source: post.content,
    components: {},
  });

  return (
    <BlogPost
      title={post.title}
      date={post.date}
      readingTime={post.readingTime}
      content={content}
      relatedPosts={relatedPosts}
    />
  );
}
