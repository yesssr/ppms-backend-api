import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const config = {
  app: {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT) || 8080,
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  },
  database: {
    url: required("DATABASE_URL"),
  },
  auth: {
    betterAuthUrl: required("BETTER_AUTH_URL"),
    betterAuthSecret: required("BETTER_AUTH_SECRET"),
  },
  storage: {
    accessKey: required("AWS_ACCESS_KEY_ID"),
    secretKey: required("AWS_SECRET_ACCESS_KEY"),
    region: required("AWS_REGION"),
    bucketName: required("AWS_BUCKET_NAME"),
    endpointUrlS3: required("AWS_ENDPOINT_URL_S3"),
    endpointUrlIAM: required("AWS_ENDPOINT_URL_IAM"),
    publicUrl: required("PUBLIC_URL"),
  },
};
