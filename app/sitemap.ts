import { MetadataRoute } from 'next';
import prisma from '@/app/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.boblo.ir';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const [users, tweets] = await Promise.all([
      prisma.user.findMany({
        select: { userName: true, createdAt: true },
        take: 1000,
      }),
      prisma.tweet.findMany({
        select: { id: true, createdAt: true },
        take: 1000,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const userRoutes: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/${user.userName}`,
      lastModified: user.createdAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    const tweetRoutes: MetadataRoute.Sitemap = tweets.map((tweet) => ({
      url: `${baseUrl}/tweet/${tweet.id}`,
      lastModified: tweet.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...userRoutes, ...tweetRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap:', error);
    return staticRoutes;
  }
}
