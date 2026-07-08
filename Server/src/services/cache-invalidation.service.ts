import { getRedis } from '../config/redis.js';

export async function invalidateKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await getRedis().del(...keys);
  } catch {
    // fail-safe: cache invalidation must not break admin mutate
  }
}

export async function invalidateCatalogAndHomeCache(): Promise<void> {
  const redis = getRedis();
  const staticKeys = [
    'catalog:tree',
    'site:settings',
    'home:payload',
    'home:editor_choice',
    'home:banners',
  ];

  const dynamicKeys = await redis.keys('catalog:products:*');
  const productKeys = await redis.keys('product:slug:*');
  const cmsKeys = await redis.keys('cms:page:*');
  const reviewKeys = await redis.keys('reviews:list:*');

  await invalidateKeys([
    ...staticKeys,
    ...dynamicKeys,
    ...productKeys,
    ...cmsKeys,
    ...reviewKeys,
  ]);
}
