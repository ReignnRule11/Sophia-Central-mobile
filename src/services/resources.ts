import axios from 'axios';

export type ResourceQuery = {
  search?: string;
  course?: string;
  topic?: string;
  type?: string;
  page?: number;
  limit?: number;
};

export type NormalizedResource = {
  id: string;
  title: string;
  course?: string;
  topic?: string;
  institution?: string;
  type?: string;
  description?: string;
  url?: string;
  tags?: string[];
  rating?: number;
  uploader?: {
    firstName?: string;
    lastName?: string;
  };
};

const safeString = (value: unknown, fallback = '') => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
};

const normalizeResource = (raw: any): NormalizedResource => {
  const uploader = raw?.uploader ?? raw?.uploadedBy ?? {};

  return {
    id: safeString(raw?.id ?? raw?._id ?? raw?.resourceId, `resource-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: safeString(raw?.title ?? raw?.name ?? 'Untitled resource', 'Untitled resource'),
    course: safeString(raw?.course ?? raw?.courseCode ?? raw?.subject ?? ''),
    topic: safeString(raw?.topic ?? raw?.topicName ?? raw?.category ?? ''),
    institution: safeString(raw?.institution ?? raw?.school ?? raw?.university ?? ''),
    type: safeString(raw?.type ?? raw?.resourceType ?? 'Resource'),
    description: safeString(
      raw?.description ?? raw?.summary ?? 'Academic material curated for study and research.',
      'Academic material curated for study and research.',
    ),
    url: safeString(raw?.url ?? raw?.link ?? raw?.fileUrl ?? ''),
    tags: Array.isArray(raw?.tags) ? raw.tags.map((tag: any) => safeString(tag, 'Academic')) : ['Verified', 'Academic'],
    rating: typeof raw?.rating === 'number' ? raw.rating : 4.8,
    uploader: {
      firstName: safeString(uploader?.firstName ?? uploader?.first_name ?? '', 'Sophia'),
      lastName: safeString(uploader?.lastName ?? uploader?.last_name ?? '', 'Member'),
    },
  };
};

const getPayloadList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const possibleKeys = ['data', 'items', 'results', 'resources', 'content'];
  for (const key of possibleKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  return Object.values(payload).filter(Array.isArray).flat();
};

export async function fetchResources(params: ResourceQuery = {}) {
  try {
    const response = await axios.get(`${process.env.API_URL ?? 'http://localhost:3000'}/resources`, {
      params,
      timeout: 20000,
    });

    const payload = response.data ?? {};
    const items = getPayloadList(payload);
    const normalized = items.map(normalizeResource);

    return {
      items: normalized,
      page: Number(payload.page ?? params.page ?? 1),
      totalPages: Number(payload.totalPages ?? payload.pages ?? 1),
      totalItems: Number(payload.totalItems ?? payload.total ?? normalized.length),
    };
  } catch (_error) {
    return {
      items: [],
      page: Number(params.page ?? 1),
      totalPages: 1,
      totalItems: 0,
    };
  }
}

export const normalizeResourceArray = (items: any[] = []) => items.map(normalizeResource);
