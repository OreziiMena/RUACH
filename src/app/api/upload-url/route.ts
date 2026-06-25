import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import StorageServerInstance from '@/services/cloudflare/storage';
import fs from 'fs/promises';
import path from 'path';

export const POST = errorHandler(async (request) => {
  const body = await request.json();

  const { presignedUrl, key, url } = await StorageServerInstance.generatePresignedUrl(body);
  return NextResponse.json({ presignedUrl, key, url });
});

export const PUT = errorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = path.join(process.cwd(), 'public', 'uploads', key);
  const dirPath = path.dirname(filePath);

  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, buffer);

  return NextResponse.json({ success: true });
});

export const DELETE = errorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  await StorageServerInstance.deleteFromR2(key);
  return NextResponse.json({ success: true });
});