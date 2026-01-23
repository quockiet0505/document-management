// local.storage.ts
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import type {
  StorageProvider,
  PresignedUpload,
  PresignedDownload,
  UploadBufferInput,
} from "./storage.interface"

const BASE_URL = "http://localhost:4000"
const UPLOAD_DIR = path.join(process.cwd(), "uploads")

export class LocalStorage implements StorageProvider {

  // implement uploadBuffer
  async uploadBuffer(
    input: UploadBufferInput
  ): Promise<{ storageKey: string }> {
    const storageKey = `${randomUUID()}-${input.fileName}`
    const filePath = path.join(UPLOAD_DIR, storageKey)

    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    await fs.writeFile(filePath, input.buffer)

    return { storageKey }
  }

  // implement getUploadUrl
  async getUploadUrl(params: {
    fileName: string
    mimeType: string
  }): Promise<PresignedUpload> {
    const storageKey = `${randomUUID()}-${params.fileName}`
    return {
      uploadUrl: `${BASE_URL}/__local_upload/${storageKey}`,
      storageKey,
    }
  }

  // implement getDownloadUrl
  async getDownloadUrl(params: {
    storageKey: string
  }): Promise<PresignedDownload> {
    return {
      downloadUrl: `${BASE_URL}/__local_download/${params.storageKey}`,
      expiresIn: 300,
    }
  }
}
