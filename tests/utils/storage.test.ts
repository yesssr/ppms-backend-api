import { describe, test, expect, mock } from "bun:test";

const mockConfig = {
  storage: {
    bucketName: "test-bucket",
    publicUrl: "https://cdn.example.com",
    endpointUrlS3: "https://s3.example.com",
    region: "us-east-1",
    accessKey: "test-key",
    secretKey: "test-secret",
    endpointUrlIAM: "https://iam.example.com",
  },
};

mock.module("../../src/config/conf.js", () => ({
  config: mockConfig,
}));

mock.module("@aws-sdk/client-s3", () => ({
  S3Client: class {},
  PutObjectCommand: class {},
  DeleteObjectCommand: class {},
  GetObjectCommand: class {},
}));

mock.module("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mock(() => Promise.resolve("https://signed.url")),
}));

const { TigrisStorageService } = await import("../../src/utils/storage");

describe("TigrisStorageService", () => {
  const service = new TigrisStorageService();

  describe("generateKey", () => {
    test("starts with the given prefix", () => {
      const key = service.generateKey("projects/thumbnails", "photo.png");
      expect(key).toMatch(/^projects\/thumbnails\//);
    });

    test("preserves the file extension", () => {
      const key = service.generateKey("docs", "report.pdf");
      expect(key).toMatch(/\.pdf$/);
    });

    test("uses full name as extension when no dot present", () => {
      const key = service.generateKey("docs", "makefile");
      expect(key).toMatch(/\.makefile$/);
    });

    test("contains timestamp and random chars", () => {
      const key = service.generateKey("prefix", "file.jpg");
      const parts = key.split("/").pop()!;
      const nameParts = parts.split("-");
      expect(nameParts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getPublicUrl", () => {
    test("concatenates publicUrl with key", () => {
      const url = service.getPublicUrl("projects/photo.jpg");
      expect(url).toBe("https://cdn.example.com/projects/photo.jpg");
    });
  });
});
