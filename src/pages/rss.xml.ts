import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('blog')).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const base = site ?? new URL('https://toma.app');
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <description>${escapeXml(post.data.description)}</description>
      <link>${new URL(`/blog/${post.id}/`, base)}</link>
      <guid>${new URL(`/blog/${post.id}/`, base)}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      <category>${escapeXml(post.data.category)}</category>
    </item>`).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
    <title>Toma | Desde la cabina</title>
    <description>Historias para ver y conversar.</description>
    <link>${base}</link>${items}
  </channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] ?? character);
}
