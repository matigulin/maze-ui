import {
  Advantage,
  Banner,
  EditorChoiceItem,
  InfoSlide,
  PartnerBrand,
} from '../models/content.js';
import { cache } from './cache.service.js';
import { listProductSummariesByIds, type ProductListItemDto } from './catalog.service.js';

export interface HomeBannerDto {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string;
  size: string;
}

export interface HomeSlideDto {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface HomeAdvantageDto {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface HomePartnerBrandDto {
  id: string;
  name: string;
  logo: string;
  categorySlug: string | null;
  link: string | null;
}

export interface HomePayload {
  editorChoice: ProductListItemDto[];
  banners: HomeBannerDto[];
  infoSlides: HomeSlideDto[];
  advantages: HomeAdvantageDto[];
  partnerBrands: HomePartnerBrandDto[];
}

async function loadEditorChoice(): Promise<ProductListItemDto[]> {
  const items = await EditorChoiceItem.findAll({
    order: [['sort_order', 'ASC']],
    attributes: ['product_id'],
  });

  const productIds = items.map((item) => item.product_id);
  return listProductSummariesByIds(productIds);
}

async function loadBanners(): Promise<HomeBannerDto[]> {
  const rows = await Banner.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'title', 'subtitle', 'image_url', 'link', 'size'],
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image_url,
    link: row.link,
    size: row.size,
  }));
}

async function loadInfoSlides(): Promise<HomeSlideDto[]> {
  const rows = await InfoSlide.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'icon', 'title', 'description'],
  });

  return rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    desc: row.description,
  }));
}

async function loadAdvantages(): Promise<HomeAdvantageDto[]> {
  const rows = await Advantage.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'icon', 'title', 'description'],
  });

  return rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    desc: row.description,
  }));
}

async function loadPartnerBrands(): Promise<HomePartnerBrandDto[]> {
  const rows = await PartnerBrand.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'name', 'logo_url', 'category_slug', 'link'],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    logo: row.logo_url,
    categorySlug: row.category_slug,
    link: row.link,
  }));
}

async function loadHome(): Promise<HomePayload> {
  const [editorChoice, banners, infoSlides, advantages, partnerBrands] = await Promise.all([
    loadEditorChoice(),
    loadBanners(),
    loadInfoSlides(),
    loadAdvantages(),
    loadPartnerBrands(),
  ]);

  return { editorChoice, banners, infoSlides, advantages, partnerBrands };
}

export async function getHome(): Promise<HomePayload> {
  return cache.getOrSet('home:payload', 5 * 60, loadHome);
}

export async function getEditorChoice(): Promise<ProductListItemDto[]> {
  return cache.getOrSet('home:editor_choice', 5 * 60, loadEditorChoice);
}

export async function getBanners(): Promise<HomeBannerDto[]> {
  return cache.getOrSet('home:banners', 10 * 60, loadBanners);
}
