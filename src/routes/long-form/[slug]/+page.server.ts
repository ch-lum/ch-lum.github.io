import { error } from '@sveltejs/kit';
import { longFormPosts, renderMarkdown } from '$lib/server/long-form';

export function entries() {
  return longFormPosts.map(({ slug }) => ({ slug }));
}

export function load({ params }) {
  const post = longFormPosts.find(({ slug }) => slug === params.slug);
  if (!post) error(404, 'Post not found');

  return {
    post: {
      ...post,
      html: renderMarkdown(post.body),
      body: undefined
    }
  };
}
