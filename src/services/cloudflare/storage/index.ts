import { v4 as uuidv4 } from 'uuid';
import {
  ALLOWED_TYPES,
  GeneratePresignedUrlPramaters,
  GeneratePresignedUrlResponse,
} from '@/contracts/media';
import { BadRequestError } from '@/lib/errors';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Environment variables
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESSKEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

class CloudflareR2StorageServer {
  private _r2Client: S3Client | null = null;
  private publicUrl: string = '';
  private isLocal: boolean = false;
  private readonly MAX_SIZE = 10 * 1024 * 1024;

  constructor() {
    const isPlaceholder = (val?: string) => {
      if (!val) return true;
      const clean = val.toLowerCase().replace(/['"]/g, '');
      return clean.includes('your-') || clean === '';
    };

    if (
      isPlaceholder(cloudflareAccountId) ||
      isPlaceholder(accessKeyId) ||
      isPlaceholder(secretAccessKey) ||
      isPlaceholder(bucketName) ||
      isPlaceholder(publicUrl)
    ) {
      console.warn('Cloudflare environment variables are not set or are placeholders. Falling back to local storage.');
      this.isLocal = true;
      this.publicUrl = '/uploads';
      return;
    }

    this.publicUrl = publicUrl!.replace(/['"]/g, '');

    this._r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${cloudflareAccountId!.replace(/['"]/g, '')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!.replace(/['"]/g, ''),
        secretAccessKey: secretAccessKey!.replace(/['"]/g, ''),
      },
    });
  }

  generatePublicUrl = (key: string) => {
    if (this.isLocal) {
      return `/uploads/${key}`;
    }
    return `${this.publicUrl}/${key}`;
  };

  generatePresignedUrl = async ({
    fileType,
    fileSize,
    folder,
  }: GeneratePresignedUrlPramaters): Promise<GeneratePresignedUrlResponse> => {
    if (!ALLOWED_TYPES.includes(fileType))
      throw new BadRequestError('Invalid file type');
    if (fileSize > this.MAX_SIZE) throw new BadRequestError('File too large');

    const ext = fileType.split('/')[1];
    const key = `${folder}/${uuidv4()}.${ext}`;

    if (this.isLocal) {
      const presignedUrl = `/api/upload-url?key=${key}`;
      const url = this.generatePublicUrl(key);
      return { presignedUrl, key, url };
    }

    const command = new PutObjectCommand({
      Bucket: bucketName!.replace(/['"]/g, ''),
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(this._r2Client!, command, {
      expiresIn: 60, // 60 seconds
    });
    
    const url = this.generatePublicUrl(key);

    return { presignedUrl, key, url };
  };

  deleteFromR2 = async (key: string) => {
    if (this.isLocal) {
      try {
        const fs = require('fs/promises');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'public', 'uploads', key);
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Failed to delete local file:', e);
      }
      return;
    }

    await this._r2Client!.send(
      new DeleteObjectCommand({
        Bucket: bucketName!.replace(/['"]/g, ''),
        Key: key,
      }),
    );
  };
}

const StorageServerInstance = new CloudflareR2StorageServer();

export default StorageServerInstance;
