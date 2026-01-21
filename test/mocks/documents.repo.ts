import { vi } from "vitest"

// serve as a database
export const DocumentsRepo = {
  isOrgMember: vi.fn(),
  listDocuments: vi.fn(),
  getDocumentById: vi.fn(),
  createDocument: vi.fn(),
  createDocumentVersion: vi.fn(),
  updateDocument: vi.fn(),
  softDeleteDocument: vi.fn(),
  searchDocuments: vi.fn(),
  getSharePermission: vi.fn(),
  listDocumentVersions: vi.fn(),
  getDocumentSummary: vi.fn(),
}
