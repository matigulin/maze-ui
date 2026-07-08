import { SiteSetting } from '../models/reference.js';
import { cache } from './cache.service.js';

const CACHE_KEY = 'site:settings';
const CACHE_TTL = 30 * 60;

interface SiteConfigValue {
  phone?: string;
  address?: string;
  metro?: string;
  hours?: string;
  email?: string;
  social?: {
    telegram?: string;
    vk?: string;
    youtube?: string;
    telegramUsed?: string;
  };
  mapCenter?: [number, number];
}

export interface PublicSettings {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  metro: string;
  workingHours: string;
  socialLinks: {
    telegram: string;
    vk: string;
    youtube: string;
    telegramUsed: string;
  };
  mapCoordinates: { lat: number; lng: number };
}

export function mapPublicSettings(raw: SiteConfigValue): PublicSettings {
  const [lat = 59.94, lng = 30.33] = raw.mapCenter ?? [];

  return {
    storeName: 'MAZE',
    address: raw.address ?? '',
    phone: raw.phone ?? '',
    email: raw.email ?? 'info@maze.ru',
    metro: raw.metro ?? '',
    workingHours: raw.hours ?? '',
    socialLinks: {
      telegram: raw.social?.telegram ?? '',
      vk: raw.social?.vk ?? '',
      youtube: raw.social?.youtube ?? '',
      telegramUsed: raw.social?.telegramUsed ?? '',
    },
    mapCoordinates: { lat, lng },
  };
}

async function loadPublicSettings(): Promise<PublicSettings> {
  const row = await SiteSetting.findByPk('public');
  if (!row) {
    return mapPublicSettings({});
  }

  return mapPublicSettings(row.value as SiteConfigValue);
}

export async function getPublicSettings(): Promise<PublicSettings> {
  return cache.getOrSet(CACHE_KEY, CACHE_TTL, loadPublicSettings);
}
