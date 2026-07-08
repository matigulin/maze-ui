import { mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ValidationError } from '../lib/errors.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR;
  const dir = configured ?? join('uploads');
  return isAbsolute(dir) ? dir : resolve(process.cwd(), dir);
}

export async function ensureUploadDir(): Promise<string> {
  const uploadDir = getUploadDir();
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export function getUploadPublicBaseUrl(): string {
  if (process.env.UPLOAD_PUBLIC_URL) {
    return process.env.UPLOAD_PUBLIC_URL.replace(/\/$/, '');
  }
  const port = process.env.PORT ?? '4000';
  return `http://localhost:${port}/uploads`;
}

export async function saveAdminUpload(input: {
  buffer: Buffer;
  mimetype: string;
  size: number;
}) {
  if (!ALLOWED_MIME_TYPES.has(input.mimetype)) {
    throw new ValidationError('Unsupported file type');
  }

  if (input.size > MAX_UPLOAD_BYTES) {
    throw new ValidationError('File exceeds 5 MB limit');
  }

  const extension = MIME_EXTENSION[input.mimetype];
  const filename = `${randomUUID()}${extension}`;
  const uploadDir = getUploadDir();

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), input.buffer);

  const url = `${getUploadPublicBaseUrl()}/${filename}`;
  return { url, filename };
}
