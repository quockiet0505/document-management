import { describe, it, expect, vi, beforeEach } from "vitest"

// mock aws sdk & presigner
vi.mock("@aws-sdk/client-s3", async () => {
  const mod = await import("../mocks/aws")
  return {
    S3Client: mod.S3Client,
    PutObjectCommand: mod.PutObjectCommand,
    GetObjectCommand: mod.GetObjectCommand,
  }
})

vi.mock("@aws-sdk/s3-request-presigner", async () => {
  const mod = await import("../mocks/aws")
  return {
    getSignedUrl: mod.getSignedUrl,
  }
})


import { getStorage } from "../../app/storage"
import { S3Storage } from "../../app/storage/s3.storage"
import { getSignedUrl } from "../mocks/aws"

beforeEach(() => {
  getSignedUrl.mockReset();
  vi.resetModules()
})

// getStorage
describe("getStorage", () => {
   
     it("returns S3Storage when STORAGE_DRIVE=s3", async () => {
       process.env.STORAGE_DRIVE = "s3"
   
       const { getStorage } = await import("../../app/storage")
       const storage = getStorage()
   
       expect(storage).toBeInstanceOf(
         (await import("../../app/storage/s3.storage")).S3Storage
       )
     })
   
     it("returns LocalStorage when STORAGE_DRIVE=local", async () => {
       process.env.STORAGE_DRIVE = "local"
   
       const { getStorage } = await import("../../app/storage")
       const storage = getStorage()
   
       expect(storage).toBeInstanceOf(
         (await import("../../app/storage/local.storage")).LocalStorage
       )
     })
   })
   

// getUploadUrl
describe("S3Storage.getUploadUrl", () => {
     it("generates presigned upload url", async () => {
       getSignedUrl.mockResolvedValue("https://upload-url")
   
       const storage = new S3Storage()
   
       const res = await storage.getUploadUrl({
         fileName: "test.pdf",
         mimeType: "application/pdf",
       })
   
       expect(getSignedUrl).toHaveBeenCalled()
       expect(res.uploadUrl).toBe("https://upload-url")
       expect(res.storageKey).toContain("test.pdf")
     })
   })

   
// getDownloadUrl
describe("S3Storage.getDownloadUrl", () => {
     it("generates presigned download url", async () => {
       getSignedUrl.mockResolvedValue("https://download-url")
   
       const storage = new S3Storage()
   
       const res = await storage.getDownloadUrl({
         storageKey: "file-key",
       })
   
       expect(getSignedUrl).toHaveBeenCalled()
       expect(res.downloadUrl).toBe("https://download-url")
       expect(res.expiresIn).toBe(300)
     })
   })
   