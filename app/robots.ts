import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://boblo.ir';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/profile', '/profile/edit', '/chat'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
