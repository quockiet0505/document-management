import { vi } from "vitest"

export const cache = {
     get: vi.fn(),
     set: vi.fn(),
     delete: vi.fn()
}