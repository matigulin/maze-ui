export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  isBrand: boolean;
  brandLogoUrl: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  externalLink: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryBody = {
  slug: string;
  name: string;
  parentId?: string | null;
  isBrand?: boolean;
  brandLogoUrl?: string | null;
  icon?: string | null;
  image?: string | null;
  description?: string | null;
  externalLink?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdminProductSummary = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  deviceType: string;
  basePrice: number;
  oldPrice: number | null;
  badgeType: string | null;
  badgeText: string | null;
  isPublished: boolean;
  inStock: boolean;
  ratingAvg: number;
  reviewsCount: number;
  /** Остаток из list (без N+1 getProduct). */
  stockQuantity?: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminVariant = {
  id: string;
  productId: string;
  sku: string;
  colorName: string;
  colorHex: string;
  memory: string | null;
  price: number;
  isAvailable: boolean;
  quantity: number;
  reservedQuantity: number;
  quantityAvailable: number;
};

export type AdminProductImage = {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminProductFeature = {
  id: string;
  title: string;
  description: string;
  iconUrl: string | null;
  sortOrder: number;
};

export type AdminProductSpec = {
  fieldId: string;
  fieldKey: string | null;
  fieldLabel: string | null;
  groupName: string | null;
  value: string;
};

export type AdminProductDetail = AdminProductSummary & {
  description: string | null;
  images: AdminProductImage[];
  features: AdminProductFeature[];
  variants: AdminVariant[];
  specifications: AdminProductSpec[];
};

export type ProductBody = {
  slug: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  deviceType: string;
  description?: string | null;
  basePrice: number;
  oldPrice?: number | null;
  badgeType?: string | null;
  badgeText?: string | null;
  isPublished?: boolean;
};

export type VariantBody = {
  sku: string;
  colorName: string;
  colorHex: string;
  memory?: string | null;
  price: number;
  isAvailable?: boolean;
  quantity?: number;
};

export type SpecField = {
  id: string;
  deviceType: string;
  groupName: string;
  fieldKey: string;
  fieldLabel: string;
  sortOrder: number;
};

export type AdminBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  link: string;
  size: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BannerBody = {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  link: string;
  size?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdminInfoSlide = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InfoSlideBody = {
  icon: string;
  title: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type AdminCmsPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CmsPageBody = {
  slug: string;
  title: string;
  content: string;
  metaDescription?: string | null;
  isPublished?: boolean;
};

export type PublicSettings = {
  storeName?: string;
  address?: string;
  phone?: string;
  email?: string;
  metro?: string;
  workingHours?: string;
  socialLinks?: {
    telegram?: string;
    vk?: string;
    youtube?: string;
    telegramUsed?: string;
  };
  mapCoordinates?: { lat: number; lng: number };
  [key: string]: unknown;
};

export type UploadResult = {
  url: string;
  filename: string;
};

export const DEVICE_TYPES = [
  "smartphone",
  "watch",
  "tablet",
  "macbook",
  "accessory",
  "other",
] as const;

export type ManagerOrderStatus =
  | "confirmed"
  | "awaiting_payment"
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled";

export type ManagerOrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  totalRub: number;
  itemsCount: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  assignedManagerId: string | null;
  createdAt: string;
};

export type ManagerOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  userId: string | null;
  assignedManagerId: string | null;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  totals: {
    subtotalRub: number;
    deliveryRub: number;
    paymentFeeRub: number;
    installmentFeeRub: number;
    totalRub: number;
  };
  delivery: {
    type: string;
    city: string;
    street: string;
    house: string;
    apartment: string | null;
    requiresPrepay: boolean;
  } | null;
  payment: {
    methodCode: string;
    methodName: string;
    isPaid: boolean;
  } | null;
  items: Array<{
    id: string;
    name: string;
    image: string;
    color: string | null;
    memory: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  comment: string | null;
  pricingVersion: string;
  notes: Array<{
    id: string;
    staffUserId: string;
    text: string;
    createdAt: string;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    staffUserId: string | null;
    note: string | null;
    createdAt: string;
  }>;
  createdAt: string;
};

export type ManagerStaffRow = {
  id: string;
  email: string;
  name: string;
  role: string;
};
