import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/index.js';

class StorageService {
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: config.r2.endpoint,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
      },
    });
    this.bucket = config.r2.bucket;
    this.publicUrl = config.r2.publicUrl;
  }

  async upload(file, folder = 'posts') {
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${file.extension || 'jpg'}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);
    
    return {
      key,
      url: `${this.publicUrl}/${key}`,
    };
  }

  async getPresignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async getPresignedUploadUrl(key, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}

export default new StorageService();