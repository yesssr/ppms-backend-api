import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config/conf.js";

export interface StorageService {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  generateKey(prefix: string, filename: string): string;
}

export class TigrisStorageService implements StorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = config.storage.bucketName;
    this.publicUrl = config.storage.publicUrl;

    this.client = new S3Client({
      endpoint: config.storage.endpointUrlS3,
      region: config.storage.region,
      credentials: {
        accessKeyId: config.storage.accessKey,
        secretAccessKey: config.storage.secretKey,
      },
    });
  }

  generateKey(prefix: string, filename: string): string {
    const ext = filename.split(".").pop() || "bin";
    const name = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    return name;
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.client.send(command);

    return this.getPublicUrl(key);
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }
}

export const storageService = new TigrisStorageService();
