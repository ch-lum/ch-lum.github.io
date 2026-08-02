import { longFormPosts } from '$lib/server/long-form';

export function load() {
  return {
    posts: longFormPosts.map(({ body: _body, ...post }) => post)
  };
}
