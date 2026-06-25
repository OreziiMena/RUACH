import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.R2_ACCESSKEY_ID = 'access-key';
  process.env.R2_SECRET_ACCESS_KEY = 'secret-key';
  process.env.R2_BUCKET_NAME = 'bucket-name';
  process.env.R2_PUBLIC_URL = 'https://public.example.com';

  return {
    sendMock: vi.fn(),
    getSignedUrlMock: vi.fn(),
    putObjectCommandMock: vi.fn(),
    deleteObjectCommandMock: vi.fn(),
    uuidv4Mock: vi.fn(),
  };
});

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class S3Client {
    send = mocks.sendMock;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_: unknown) {}
  },
  PutObjectCommand: class PutObjectCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
      mocks.putObjectCommandMock(input);
    }
  },
  DeleteObjectCommand: class DeleteObjectCommand {
    input: unknown;
    constructor(input: unknown) {
      this.input = input;
      mocks.deleteObjectCommandMock(input);
    }
  },
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mocks.getSignedUrlMock,
}));

vi.mock('uuid', () => ({
  v4: mocks.uuidv4Mock,
}));

import StorageServerInstance from '@/services/cloudflare/storage';
import { BadRequestError } from '@/lib/errors';
import { ALLOWED_TYPES } from '@/contracts/media';

describe('CloudflareR2StorageServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a public url from the configured base url', () => {
    expect(StorageServerInstance.generatePublicUrl('images/photo.png')).toBe(
      'https://public.example.com/images/photo.png',
    );
  });

  it('generates a presigned upload url for allowed file types', async () => {
    mocks.uuidv4Mock.mockReturnValue('uuid-123');
    mocks.getSignedUrlMock.mockResolvedValue('https://signed.example.com/upload');

    const result = await StorageServerInstance.generatePresignedUrl({
      fileType: ALLOWED_TYPES[0],
      fileSize: 1024,
      folder: 'products',
    });

    expect(result).toEqual({
      presignedUrl: 'https://signed.example.com/upload',
      key: 'products/uuid-123.jpeg',
      url: 'https://public.example.com/products/uuid-123.jpeg',
    });
    expect(mocks.putObjectCommandMock).toHaveBeenCalledWith({
      Bucket: 'bucket-name',
      Key: 'products/uuid-123.jpeg',
      ContentType: ALLOWED_TYPES[0],
      ContentLength: 1024,
    });
    expect(mocks.getSignedUrlMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid file types', async () => {
    await expect(
      StorageServerInstance.generatePresignedUrl({
        fileType: 'application/pdf' as never,
        fileSize: 1024,
        folder: 'products',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects oversized files', async () => {
    await expect(
      StorageServerInstance.generatePresignedUrl({
        fileType: ALLOWED_TYPES[0],
        fileSize: 11 * 1024 * 1024,
        folder: 'products',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('deletes a file from r2', async () => {
    await StorageServerInstance.deleteFromR2('products/uuid-123.jpeg');

    expect(mocks.sendMock).toHaveBeenCalledTimes(1);
    expect(mocks.deleteObjectCommandMock).toHaveBeenCalledWith({
      Bucket: 'bucket-name',
      Key: 'products/uuid-123.jpeg',
    });
  });
});
