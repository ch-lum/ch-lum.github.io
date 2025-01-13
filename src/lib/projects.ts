export interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    title: '“I’m not sure, but...”: Expert Practices that Enable Effective Code Comprehension in Data Science',
    description: 'Christopher Lum*, Guoxuan Xu*, Sam Lau (*equal contribution). ACM Technical Symposium on Computer Science Education (SIGCSE), 2025.',
    image: '/images/sigcse_paper_banner.jpg',
    link: '/documents/2025_sigcse_experts_vs_novices_SIGCSE.pdf',
    tags: ['Research', 'Data Science Pedagogy', 'SIGCSE 2025']
  },
  {
    title: 'Comment Section Sentiment Analysis',
    description: 'Visualization of positive and negative comments from a Facebook comment section.',
    image: '/images/comment_vis_banner.jpg',
    link: 'https://ch-lum.github.io/comment-vis/',
    tags: ['D3.js', 'Sentiment Analysis', 'Data Visualization']
  },
  {
    title: 'San Diego Parking Meters',
    description: 'Explore San Diego\'s neighborhoods by when and where people park.',
    image: '/images/parking_banner.jpg',
    link: 'https://ch-lum.github.io/sd-parking/',
    tags: ['D3.js', 'Frontend', 'Data Visualization']
  },
  // More projects here
]; 