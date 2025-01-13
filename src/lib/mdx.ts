import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blog')

interface BlogPost {
  slug: string;
  content: string;
  title: string;
  date: string;
  readingTime: string;
  description: string;
  excerpt?: string;
}

export function getPostBySlug(slug: string): BlogPost {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  return {
    slug,
    content,
    title: data.title,
    date: data.date,
    readingTime: data.readingTime,
    description: data.description,
  }
}

export function getAllPosts() {
  const files = fs.readdirSync(postsDirectory)
  const posts = files.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '')
    const post = getPostBySlug(slug)
    return post
  })
  
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
} 