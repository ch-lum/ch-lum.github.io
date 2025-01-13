import Image from 'next/image'
import Link from 'next/link'
import { projects } from '@/lib/projects'

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 animate-fade-in-down">Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <Link 
            href={project.link} 
            key={index}
            className="group border rounded-lg overflow-hidden hover:border-accent/40 transition-colors animate-[fade-in-down_0.5s_ease-out] [animation-delay:var(--delay)] opacity-0 [animation-fill-mode:forwards]"
            style={{ '--delay': `${(index + 1) * 0.1}s` } as React.CSSProperties}
          >
            <div className="relative h-48">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 