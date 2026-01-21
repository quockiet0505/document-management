import { vi } from "vitest"

// serve as a fake database for Shares
export const SharesRepo = {
  createShare: vi.fn(),
  findShareById: vi.fn(),
  deleteShare: vi.fn(),
  listSharedWithUser: vi.fn(),
}
