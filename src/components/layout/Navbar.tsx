'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'CV', href: '/documents/christopher-lum-cv.pdf' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-y-2">
          <Link 
            href="/" 
            className="texÍt-xl font-bold hover:text-gray-600 transition-colors"
          >
            Christopher Lum
          </Link>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'text-accent'
                    : 'hover:text-gray-600'
                } transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
} 