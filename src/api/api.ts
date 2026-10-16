import client from './client';

export type ResourceCreateRequest = { title: string; description?: string; type?: string };
export type ResourceCreateResponse = { id: string };
export type PresignResponse = { uploadUrl: string; fileKey: string; expiresIn?: number; method?: string };
export type InitiateMultipartResponse = { uploadId: string; fileKey: string; parts: { partNumber: number; uploadUrl: string }[] };
export type CompleteMultipartRequest = { uploadId: string; fileKey: string; parts: { partNumber: number; etag: string }[] };

export async function createResource(payload: ResourceCreateRequest): Promise<ResourceCreateResponse> {
  const resp = await client.post('/resources', payload);
  return resp.data;
}

export async function presignUrl(filename: string, mimeType: string, size: number): Promise<PresignResponse> {
  const resp = await client.post('/storage/presigned-url', { filename, mimeType, size });
  return resp.data;
}

export async function confirmUpload(fileKey: string, resourceId: string) {
  const resp = await client.post('/storage/confirm-upload', { fileKey, resourceId });
  return resp.data;
}

export async function initiateMultipart(filename: string, mimeType: string, size: number, chunkSize: number): Promise<InitiateMultipartResponse> {
  const resp = await client.post('/storage/initiate-multipart', { filename, mimeType, size, chunkSize });
  return resp.data;
}

export async function completeMultipart(req: CompleteMultipartRequest) {
  const resp = await client.post('/storage/complete-multipart', req);
  return resp.data;
}
