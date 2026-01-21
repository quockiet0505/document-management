import { vi } from "vitest"

// mock encore
vi.mock("encore.dev/api", async () => {
  const mod = await import("./mocks/encore")
  return mod
})

//  mock storage
vi.mock("../app/storage", async () => {
  const mod = await import("./mocks/storage")
  return mod
})

// mock cache
vi.mock("../app/cache/keyv", async () => {
  const mod = await import("./mocks/cache")
  return mod
})

// mock jobs
vi.mock("../app/jobs/document.workflow", async () => {
  const mod = await import("./mocks/jobs")
  return mod
})

// mock document repo
vi.mock("../app/documents/documents.repo", async () => {
  const mod = await import("./mocks/documents.repo")
  return mod
})