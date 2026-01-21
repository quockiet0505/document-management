import { vi } from "vitest"

export const mockStorage = {
  getUploadUrl: vi.fn().mockResolvedValue({
    uploadUrl: "https://upload-url",
    storageKey: "fake-key",
  }),

  getDownloadUrl: vi.fn().mockResolvedValue(
    "https://download-url"
  ),
}
