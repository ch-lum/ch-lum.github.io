import { getPostBySlug, getAllPosts } from '@/lib/mdx'
import { compileMDX } from 'next-mdx-remote/rsc'
import BlogPost from '@/components/layout/BlogPost'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage(props: any) {
  const post = getPostBySlug(props.params.slug)
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