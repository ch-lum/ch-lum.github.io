import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { compileMDX } from 'next-mdx-remote/rsc'
import BlogPost from '@/components/layout/BlogPost'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

type Props = {
  params: {
    slug: string
  }
}

export default async function BlogPage({ params }: Props) {
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