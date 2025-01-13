import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { compileMDX } from 'next-mdx-remote/rsc'
import BlogPost from '@/components/layout/BlogPost'
import { PageProps } from 'next/types'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({
  params,
  searchParams,
}: PageProps<{ slug: string }>) {
  const post = getPostBySlug(params.slug)
  const { content } = await compileMDX({
    source: post.content,
    components: {},
  })
  
  return (
    <BlogPost
      title={post.title}
      date={post.date}
      readingTime={post.readingTime}
      content={content}
    />
  )
} 