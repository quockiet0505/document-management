// s3.storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"
import type {
  StorageProvider,
  PresignedUpload,
  PresignedDownload,
} from "./storage.interface"

const s3 = new S3Client({
  region: "process.env.AWS_REGION!" ,
  credentials: {
    accessKeyId: "process.env.AWS_ACCESS_KEY_ID!" ,
    secretAccessKey: "process.env.AWS_SECRET_ACCESS_KEY!" ,
  },
})

const BUCKET = "process.env.AWS_S3_BUCKET!"

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
}
