export const navigation = [
  {
    label: 'Projects',
    href: '/projects/',
    image: '/home_imgs/projects-closed.svg',
    hoverImage: '/home_imgs/projects-open.svg',
    motion: 'swap'
  },
  {
    label: 'Long Form',
    href: '/long-form/',
    image: '/home_imgs/long-form-closed.svg',
    hoverImage: '/home_imgs/long-form-open.svg',
    motion: 'swap'
  },
  {
    label: 'Short Form',
    href: '/short-form/',
    image: '/home_imgs/short-form-closed.svg',
    hoverImage: '/home_imgs/short-form-open.svg',
    motion: 'swap'
  },
  {
    label: 'D&D',
    href: '/dnd/',
    image: '/home_imgs/dnd-closed.svg',
    hoverImage: '/home_imgs/dnd-open.svg',
    motion: 'swap'
  },
  { label: 'coffee', href: '/coffee/', image: '/home_imgs/kettle.PNG', motion: 'tip' },
  { label: 'music', href: '/music/', image: '/home_imgs/record.png', motion: 'spin' }
] as const;
