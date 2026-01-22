// s3.storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"
import type {
  StorageProvider,
  PresignedUpload,
  PresignedDownload,
  UploadBufferInput,
} from "./storage.interface"

import dotenv from "dotenv"
import path from "path"
// LOAD ENV FIRST!
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env'),
  override: true 
})

console.log("🔧 S3 Storage Config:")
console.log("Region:", process.env.AWS_REGION || 'not set')
console.log("Bucket:", process.env.AWS_S3_BUCKET || 'not set')
console.log("Key ID :", process.env.AWS_ACCESS_KEY_ID ? "***SET ID key***" : "NOT SET")
console.log("Access Key:", process.env.AWS_SECRET_ACCESS_KEY ? "***SET access key ***" : "NOT SET")

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "no-key-ID",
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY ||"no-access-key",
  },
})

const BUCKET = process.env.AWS_S3_BUCKET

export class S3Storage implements StorageProvider {
  async getUploadUrl(params: {
    fileName: string
    mimeType: string
  }): Promise<PresignedUpload> {
    const storageKey = `${randomUUID()}-${params.fileName}`

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: storageKey,
      ContentType: params.mimeType,
    })

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    })

    return { uploadUrl, storageKey }
  }

  async getDownloadUrl(params: {
    storageKey: string
  }): Promise<PresignedDownload> {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: params.storageKey,
    })

    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    })

    return {
      downloadUrl,
      expiresIn: 300,
    }
  }

  // Upload buffer implementation
  async uploadBuffer(input: UploadBufferInput): Promise<{ storageKey: string }> {
    const storageKey = `${randomUUID()}-${input.fileName}`

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
      })
    )

    return { storageKey }
  }
}
