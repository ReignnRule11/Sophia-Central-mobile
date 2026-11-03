import { apiClient } from '../config/api';

export type ResourceQuery = {
  q?: string;
  course?: string;
  institution?: string;
  level?: string;
  type?: string;
};

export type NormalizedResource = {
  id: string;
  title: string;
  course?: string;
  topic?: string;
  institution?: string;
  level?: string;
  type?: string;
  description?: string;
  fileUrl?: string;
  moderationStatus?: string;
  isVerified?: boolean;
  tags?: string[];
  uploader?: { firstName?: string; lastName?: string; email?: string };
};

function unwrap<T>(response: any): T {
  return (response?.data?.data ?? response?.data ?? {}) as T;
}

function asList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.resources)) return payload.resources;
  return [];
}

function normalizeResource(raw: any): NormalizedResource {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    title: String(raw?.title ?? 'Untitled resource'),
    course: raw?.course ?? undefined,
    topic: raw?.topic ?? undefined,
    institution: raw?.institution ?? undefined,
    level: raw?.level ?? undefined,
    type: raw?.type ?? undefined,
    description: raw?.description ?? undefined,
    fileUrl: raw?.fileUrl ?? undefined,
    moderationStatus: raw?.moderationStatus ?? undefined,
    isVerified: raw?.isVerified === true,
    tags: Array.isArray(raw?.tags) ? raw.tags : [],
    uploader: raw?.uploader ?? undefined,
  };
}

export async function fetchResources(params: ResourceQuery = {}) {
  const response = await apiClient.get('/resources', { params });
  const items = asList(unwrap<any>(response)).map(normalizeResource).filter((item) => item.id);
  return { items, page: 1, totalPages: 1, totalItems: items.length };
}

export async function searchResources(params: ResourceQuery = {}) {
  const response = await apiClient.get('/search', { params });
  return asList(unwrap<any>(response)).map(normalizeResource).filter((item) => item.id);
}

export const normalizeResourceArray = (items: any[] = []) =>
  items.map(normalizeResource).filter((item) => item.id);
