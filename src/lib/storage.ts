import { GeneratePresignedUrlResponse } from '@/contracts/media';
import axios from 'axios';

class CloudflareR2StorageClient {
  private static uploadUrl = '/api/upload-url';

  static uploadMedia = async (file: File, folder: string) => {
    const res = await axios.post(CloudflareR2StorageClient.uploadUrl, {
      fileType: file.type,
      fileSize: file.size,
      folder,
    });

    const { presignedUrl, key, url } = res.data as GeneratePresignedUrlResponse;

    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    return { url, key };
  };

  static deleteMedia = async (key: string) => {
    await axios.delete(CloudflareR2StorageClient.uploadUrl + '?key=' + key);
  };
}

export default CloudflareR2StorageClient;