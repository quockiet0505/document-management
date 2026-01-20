// test
import { vi } from "vitest"

export const mockUserId = "test-user-1111"
export const mockOrgId = "test-org-2222"
export const mockDocId = "test-doc-3333"

// Mock cache
export const mockCache = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
}

// Mock storage
export const mockStorage = {
  getUploadUrl: vi.fn().mockResolvedValue({
    uploadUrl: "https://mock-storage/upload-url",
    storageKey: "mock-document-key",
  }),
  getDownloadUrl: vi.fn().mockResolvedValue({
    downloadUrl: "https://mock-storage/download-url",
    expiresIn: 300
  }),
}