"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  apiDelete,
  apiGet,
  apiGetWithMeta,
  apiPatchJson,
  apiPostJson,
  apiPutJson,
  apiUpload,
  ApiError,
  type PaginationMeta,
} from "@/lib/api";
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";
import type {
  AdminBanner,
  AdminCategory,
  AdminCmsPage,
  AdminInfoSlide,
  AdminProductDetail,
  AdminProductSummary,
  AdminVariant,
  BannerBody,
  CategoryBody,
  CmsPageBody,
  InfoSlideBody,
  ProductBody,
  PublicSettings,
  SpecField,
  UploadResult,
  VariantBody,
  ManagerOrderDetail,
  ManagerOrderListItem,
  ManagerOrderStatus,
  ManagerStaffRow,
} from "./types";

export function useAdminApi() {
  const { accessToken, refreshSession } = useStaffAuth();
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const refreshOnce = useCallback(() => {
    if (!refreshInFlight.current) {
      refreshInFlight.current = refreshSession().finally(() => {
        refreshInFlight.current = null;
      });
    }
    return refreshInFlight.current;
  }, [refreshSession]);

  const withAuth = useCallback(
    async <T>(fn: (token: string) => Promise<T>): Promise<T> => {
      let token = accessToken;
      if (!token) {
        token = await refreshOnce();
      }
      if (!token) throw new ApiError({ message: "Unauthorized", status: 401, code: "UNAUTHORIZED" });

      try {
        return await fn(token);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const next = await refreshOnce();
          if (!next) throw err;
          return fn(next);
        }
        throw err;
      }
    },
    [accessToken, refreshOnce],
  );

  return useMemo(
    () => ({
      // Categories
      listCategories: (includeDeleted = false) =>
        withAuth((t) =>
          apiGet<AdminCategory[]>(
            "/admin/categories",
            { includeDeleted: includeDeleted ? "true" : undefined },
            { accessToken: t },
          ),
        ),
      createCategory: (body: CategoryBody) =>
        withAuth((t) => apiPostJson<AdminCategory>("/admin/categories", body, { accessToken: t })),
      updateCategory: (id: string, body: Partial<CategoryBody>) =>
        withAuth((t) =>
          apiPatchJson<AdminCategory>(`/admin/categories/${id}`, body, { accessToken: t }),
        ),
      deleteCategory: (id: string) =>
        withAuth((t) => apiDelete<{ ok: true }>(`/admin/categories/${id}`, { accessToken: t })),
      restoreCategory: (id: string) =>
        withAuth((t) =>
          apiPostJson<AdminCategory>(`/admin/categories/${id}/restore`, {}, { accessToken: t }),
        ),

      // Products
      listProducts: (query?: {
        page?: number;
        limit?: number;
        search?: string;
        name?: string;
        slug?: string;
        isPublished?: string;
        inStock?: string;
      }) =>
        withAuth(async (t) => {
          const res = await apiGetWithMeta<AdminProductSummary[]>("/admin/products", query, {
            accessToken: t,
          });
          return { items: res.data, meta: res.meta as PaginationMeta | undefined };
        }),
      getProduct: (id: string) =>
        withAuth((t) =>
          apiGet<AdminProductDetail>(`/admin/products/${id}`, undefined, { accessToken: t }),
        ),
      createProduct: (body: ProductBody) =>
        withAuth((t) =>
          apiPostJson<AdminProductSummary>("/admin/products", body, { accessToken: t }),
        ),
      updateProduct: (id: string, body: Partial<ProductBody>) =>
        withAuth((t) =>
          apiPatchJson<AdminProductSummary>(`/admin/products/${id}`, body, { accessToken: t }),
        ),
      deleteProduct: (id: string) =>
        withAuth((t) => apiDelete<{ ok: true }>(`/admin/products/${id}`, { accessToken: t })),
      restoreProduct: (id: string) =>
        withAuth((t) =>
          apiPostJson<AdminProductSummary>(`/admin/products/${id}/restore`, {}, { accessToken: t }),
        ),
      updateProductStock: (id: string, quantity: number) =>
        withAuth((t) =>
          apiPatchJson<{ productId: string; quantity: number; variantCount: number }>(
            `/admin/products/${id}/stock`,
            { quantity },
            { accessToken: t },
          ),
        ),

      // Variants
      listVariants: (productId: string) =>
        withAuth((t) =>
          apiGet<AdminVariant[]>(`/admin/products/${productId}/variants`, undefined, {
            accessToken: t,
          }),
        ),
      createVariant: (productId: string, body: VariantBody) =>
        withAuth((t) =>
          apiPostJson<AdminVariant>(`/admin/products/${productId}/variants`, body, {
            accessToken: t,
          }),
        ),
      updateVariant: (productId: string, variantId: string, body: Partial<VariantBody>) =>
        withAuth((t) =>
          apiPatchJson<AdminVariant>(`/admin/products/${productId}/variants/${variantId}`, body, {
            accessToken: t,
          }),
        ),
      deleteVariant: (productId: string, variantId: string) =>
        withAuth((t) =>
          apiDelete<{ ok: true }>(`/admin/products/${productId}/variants/${variantId}`, {
            accessToken: t,
          }),
        ),

      // Images / features / specs
      createImage: (
        productId: string,
        body: { url: string; sortOrder?: number; isPrimary?: boolean },
      ) => withAuth((t) => apiPostJson(`/admin/products/${productId}/images`, body, { accessToken: t })),
      updateImage: (
        productId: string,
        imageId: string,
        body: Partial<{ url: string; sortOrder: number; isPrimary: boolean }>,
      ) =>
        withAuth((t) =>
          apiPatchJson(`/admin/products/${productId}/images/${imageId}`, body, { accessToken: t }),
        ),
      deleteImage: (productId: string, imageId: string) =>
        withAuth((t) =>
          apiDelete(`/admin/products/${productId}/images/${imageId}`, { accessToken: t }),
        ),
      createFeature: (
        productId: string,
        body: { title: string; description: string; iconUrl?: string | null; sortOrder?: number },
      ) =>
        withAuth((t) =>
          apiPostJson(`/admin/products/${productId}/features`, body, { accessToken: t }),
        ),
      updateFeature: (
        productId: string,
        featureId: string,
        body: Partial<{
          title: string;
          description: string;
          iconUrl: string | null;
          sortOrder: number;
        }>,
      ) =>
        withAuth((t) =>
          apiPatchJson(`/admin/products/${productId}/features/${featureId}`, body, {
            accessToken: t,
          }),
        ),
      deleteFeature: (productId: string, featureId: string) =>
        withAuth((t) =>
          apiDelete(`/admin/products/${productId}/features/${featureId}`, { accessToken: t }),
        ),
      listSpecFields: (deviceType: string) =>
        withAuth((t) =>
          apiGet<SpecField[]>("/admin/spec-fields", { deviceType }, { accessToken: t }),
        ),
      upsertSpecs: (productId: string, values: Array<{ fieldId: string; value: string }>) =>
        withAuth((t) =>
          apiPutJson(`/admin/products/${productId}/specifications`, { values }, { accessToken: t }),
        ),

      // Content
      listBanners: () =>
        withAuth((t) => apiGet<AdminBanner[]>("/admin/banners", undefined, { accessToken: t })),
      createBanner: (body: BannerBody) =>
        withAuth((t) => apiPostJson<AdminBanner>("/admin/banners", body, { accessToken: t })),
      updateBanner: (id: string, body: Partial<BannerBody>) =>
        withAuth((t) =>
          apiPatchJson<AdminBanner>(`/admin/banners/${id}`, body, { accessToken: t }),
        ),
      deleteBanner: (id: string) =>
        withAuth((t) => apiDelete<{ ok: true }>(`/admin/banners/${id}`, { accessToken: t })),

      listSlides: () =>
        withAuth((t) =>
          apiGet<AdminInfoSlide[]>("/admin/info-slides", undefined, { accessToken: t }),
        ),
      createSlide: (body: InfoSlideBody) =>
        withAuth((t) => apiPostJson<AdminInfoSlide>("/admin/info-slides", body, { accessToken: t })),
      updateSlide: (id: string, body: Partial<InfoSlideBody>) =>
        withAuth((t) =>
          apiPatchJson<AdminInfoSlide>(`/admin/info-slides/${id}`, body, { accessToken: t }),
        ),
      deleteSlide: (id: string) =>
        withAuth((t) => apiDelete<{ ok: true }>(`/admin/info-slides/${id}`, { accessToken: t })),

      listCmsPages: () =>
        withAuth((t) => apiGet<AdminCmsPage[]>("/admin/cms-pages", undefined, { accessToken: t })),
      getCmsPage: (id: string) =>
        withAuth((t) =>
          apiGet<AdminCmsPage>(`/admin/cms-pages/${id}`, undefined, { accessToken: t }),
        ),
      createCmsPage: (body: CmsPageBody) =>
        withAuth((t) => apiPostJson<AdminCmsPage>("/admin/cms-pages", body, { accessToken: t })),
      updateCmsPage: (id: string, body: Partial<CmsPageBody>) =>
        withAuth((t) =>
          apiPatchJson<AdminCmsPage>(`/admin/cms-pages/${id}`, body, { accessToken: t }),
        ),
      deleteCmsPage: (id: string) =>
        withAuth((t) => apiDelete<{ ok: true }>(`/admin/cms-pages/${id}`, { accessToken: t })),

      // Settings
      getPublicSettings: () => apiGet<PublicSettings>("/settings/public"),
      updateSiteSettings: (body: Record<string, unknown>) =>
        withAuth((t) =>
          apiPatchJson<PublicSettings>("/admin/site-settings", body, { accessToken: t }),
        ),
      setEditorChoice: (productIds: string[]) =>
        withAuth((t) =>
          apiPutJson<{ productIds: string[] }>("/admin/editor-choice", { productIds }, {
            accessToken: t,
          }),
        ),
      getHomeEditorChoice: () =>
        apiGet<{ editorChoice: Array<{ id: string; title: string; slug: string }> }>("/home").then(
          (h) => h.editorChoice,
        ),

      // Upload
      upload: (file: File) =>
        withAuth((t) => apiUpload<UploadResult>("/admin/uploads", file, { accessToken: t })),

      // Orders (manager API)
      listOrders: (query?: {
        page?: number;
        limit?: number;
        status?: string;
        assignedTo?: "me" | "all";
      }) =>
        withAuth(async (t) => {
          const res = await apiGetWithMeta<ManagerOrderListItem[]>(
            "/manager/orders",
            { assignedTo: "all", ...query },
            { accessToken: t },
          );
          return { items: res.data, meta: res.meta as PaginationMeta | undefined };
        }),
      getOrder: (id: string) =>
        withAuth((t) =>
          apiGet<ManagerOrderDetail>(`/manager/orders/${id}`, undefined, { accessToken: t }),
        ),
      updateOrderStatus: (id: string, body: { status: ManagerOrderStatus; comment?: string }) =>
        withAuth((t) =>
          apiPatchJson<ManagerOrderDetail>(`/manager/orders/${id}/status`, body, {
            accessToken: t,
          }),
        ),
      addOrderNote: (id: string, text: string) =>
        withAuth((t) =>
          apiPostJson<{ id: string; staffUserId: string; text: string; createdAt: string }>(
            `/manager/orders/${id}/notes`,
            { text },
            { accessToken: t },
          ),
        ),
      assignOrder: (id: string, managerId: string) =>
        withAuth((t) =>
          apiPatchJson<{ orderId: string; assignedManagerId: string }>(
            `/manager/orders/${id}/assign`,
            { managerId },
            { accessToken: t },
          ),
        ),
      listStaff: () =>
        withAuth((t) =>
          apiGet<ManagerStaffRow[]>("/manager/staff", undefined, { accessToken: t }),
        ),
    }),
    [withAuth],
  );
}
