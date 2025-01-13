import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/mdx";
import { projects } from "@/lib/projects";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24 animate-fade-in-down">
        <div className="relative">
          <div className="relative bg-white p-8 rounded-2xl border border-accent/20">
            <h1 className="text-4xl font-bold mb-4">
              Hi, I'm Christopher Lum 👋
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              I'm a data scientist and software engineer passionate about using data 
              to tell stories and solve problems.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/projects"
                className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
              >
                View Projects
              </Link>
              <Link
                href="/blog"
                className="border border-accent text-accent px-6 py-2 rounded-lg hover:bg-accent hover:text-white transition-colors"
              >
                Read Blog
              </Link>
            </div>
          </div>
        </div>
        <div className="relative w-fit">
          <Image
            src="/images/profile.jpg"
            alt="Christopher Lum"
            width={400}
            height={400}
            className="rounded-2xl"
          />
        </div>
      </div>

      {/* Recent Works Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Recent Projects */}
        <div className="animate-[fade-in-down_0.5s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Link href="/projects" className="text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-6">
            {recentProjects.map((project, index) => (
              <Link 
                key={index} 
                href={project.link}
                className="block p-6 border border-accent/20 rounded-lg hover:border-accent/40 transition-colors"
              >
                <h3 className="font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="animate-[fade-in-down_0.5s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Posts</h2>
            <Link href="/blog" className="text-accent hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <Link 
                key={post.slug} 
                href={`/blog/${post.slug}`}
                className="block p-6 border border-accent/20 rounded-lg hover:border-accent/40 transition-colors"
              >
                <h3 className="font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-2">{post.description}</p>
                <div className="text-sm text-gray-500">{post.date}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
