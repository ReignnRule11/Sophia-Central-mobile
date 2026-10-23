import client from './client';

export type ResourceCreateRequest = { title: string; description?: string; type?: string };
export type ResourceCreateResponse = { id: string };
export type PresignResponse = {
  presignedUrl: string;
  uploadId: string;
  fileName: string;
  resourceId: string;
  expiresIn: number;
  bucket: string;
  key: string;
};

export async function createResource(payload: ResourceCreateRequest): Promise<ResourceCreateResponse> {
  const resp = await client.post('/resources', payload);
  return resp.data;
}

export async function presignUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  resourceId: string,
): Promise<PresignResponse> {
  const resp = await client.post('/storage/presigned-url', {
    fileName,
    fileType,
    fileSize,
    resourceId,
  });
  return resp.data;
}

export async function confirmUpload(uploadId: string, resourceId: string, fileName: string) {
  const resp = await client.post('/storage/confirm-upload', { uploadId, resourceId, fileName });
  return resp.data;
}
