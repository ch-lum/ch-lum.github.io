export const navigation = [
  {
    label: 'Projects',
    href: '/projects/',
    image: '/home_imgs/optimized/projects-closed.webp',
    hoverImage: '/home_imgs/optimized/projects-open.webp',
    motion: 'swap'
  },
  {
    label: 'Long Form',
    href: '/long-form/',
    image: '/home_imgs/optimized/long-form-closed.webp',
    hoverImage: '/home_imgs/optimized/long-form-open.webp',
    motion: 'swap'
  },
  {
    label: 'Short Form',
    href: '/short-form/',
    image: '/home_imgs/optimized/short-form-closed.webp',
    hoverImage: '/home_imgs/optimized/short-form-open.webp',
    motion: 'swap'
  },
  // {
  //   label: 'D&D',
  //   href: '/dnd/',
  //   image: '/home_imgs/dnd-closed.PNG',
  //   hoverImage: '/home_imgs/dnd-open.PNG',
  //   motion: 'swap'
  // },
  {
    label: 'Pins & Places',
    href: '/pins/',
    image: '/home_imgs/optimized/pin-closed.webp',
    hoverImage: '/home_imgs/optimized/pin-backing.webp',
    motion: 'separate'
  },
  { label: 'coffee', href: '/coffee/', image: '/home_imgs/optimized/kettle.webp', motion: 'tip' },
  { label: 'music', href: '/music/', image: '/home_imgs/optimized/record.webp', motion: 'spin' }
] as const;
