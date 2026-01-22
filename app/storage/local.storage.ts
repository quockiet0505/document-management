// local.storage
import path from "path"
import { randomUUID } from "crypto"
import type {
  StorageProvider,
  PresignedUpload,
  PresignedDownload,
} from "./storage.interface"

const BASE_URL = "http://localhost:4000"
const UPLOAD_DIR = path.join(process.cwd(), "uploads")

export class LocalStorage implements StorageProvider {
  uploadBuffer(arg0: { buffer: Buffer<ArrayBufferLike>; fileName: string; mimeType: string }): { storageKey: any } | PromiseLike<{ storageKey: any }> {
    throw new Error("Method not implemented.")
  }
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

  async getDownloadUrl(params: {
    storageKey: string
  }): Promise<PresignedDownload> {
    return {
      downloadUrl: `${BASE_URL}/__local_download/${params.storageKey}`,
      expiresIn: 300,
    }
  }
}
