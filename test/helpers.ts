import { vi } from "vitest"
import { cache } from "../app/cache/keyv"
import { getUploadUrl } from "../app/documents/documents.api"

export const mockUserId = "1111"
export const mockOrgId = "2222"
export const mockDocId = "3333"

// mock cache
vi.mock("../app/cache/keyv", () => ({
     cache: {
          get: vi.fn(),
          set: vi.fn(),
          delete: vi.fn(),
},
}))

// mock storage

vi.mock("../app/storage", () => ({
     getStorage: () =>({
          getUploadUrl: vi.fn().mockResolvedValue({
               uploadUrl: "https://mock-storage/upload-url",
               documentKey: "mock-document-key",
          }),

          getDownloadUrl: vi.fn().mockResolvedValue({
               downloadUrl: "https://mock-storage/download-url",
               expires: 300
          }),
     })
})
)