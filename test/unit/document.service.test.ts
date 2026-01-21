import { vi, describe, it, expect, beforeEach } from "vitest"

vi.mock("../../app/shared/permissions", () => ({
     requireRole: vi.fn(),
}))
   
vi.mock("../../app/shared/document-permissions", () => ({
     requireDocumentPermission: vi.fn(),
}))
   
import { DocumentsService } from "../../app/documents/documents.service"
import { DocumentsRepo } from "../mocks/documents.repo"
import { requireRole } from "../../app/shared/permissions"
import { requireDocumentPermission } from "../../app/shared/document-permissions"
import { cache } from "../mocks/cache"
import { APIError, ErrCode } from "encore.dev/api"

// common test data
const userId = "user-1"
const orgId = "org-1"
const docId = "doc-1"


// reset mocks before each test
beforeEach(() => {
  Object.values(DocumentsRepo).forEach(fn => fn.mockReset())
  Object.values(cache).forEach(fn => fn.mockReset())
})


//  getDocumentById
describe("DocumentsService.getDocumentById", () => {
  it("returns cached document if cache hit", async () => {
     // mock cache hit
    cache.get.mockResolvedValue({ id: docId })

     // call service
    const result = await DocumentsService.getDocumentById(userId, docId)

    expect(result.id).toBe(docId)
    expect(DocumentsRepo.getDocumentById).not.toHaveBeenCalled()
  })

  it("throws NotFound if document does not exist", async () => {
     // mock cache miss
    cache.get.mockResolvedValue(null)
    DocumentsRepo.getDocumentById.mockResolvedValue(null)

    await expect(
      DocumentsService.getDocumentById(userId, docId)
    ).rejects.toBeInstanceOf(APIError)
  })
})

//    createDocument
describe("DocumentsService.createDocument", () => {
  it("throws when role denied", async () => {
     // mock permission denied
    (requireRole as any).mockRejectedValue(
      new APIError(ErrCode.PermissionDenied, "Denied")
    )

    await expect(
      DocumentsService.createDocument(userId, {
        organizationId: orgId,
      } as any)
    ).rejects.toBeInstanceOf(APIError)
  })

  it("creates document with version 1", async () => {
     // mock permission granted
    (requireRole as any).mockResolvedValue({ role: "member" })

    DocumentsRepo.createDocument.mockResolvedValue({
      id: docId,
      latestVersion: 1,
    })

//     mock createDocumentVersion
    const res = await DocumentsService.createDocument(userId, {
      organizationId: orgId,
    } as any)

    expect(DocumentsRepo.createDocumentVersion).toHaveBeenCalledWith(
      expect.objectContaining({ version: 1 })
    )
    expect(res.id).toBe(docId)
  })
})


//   updateDocument
describe("DocumentsService.updateDocument", () => {
  it("updates document when permission granted", async () => {
     // mock permission granted
    (requireDocumentPermission as any).mockResolvedValue({ id: docId })

    const res = await DocumentsService.updateDocument(
      userId,
      docId,
      { name: "updated" } as any
    )

    expect(res.success).toBe(true)
  })

  it("throws when permission denied", async () => {
     // mock permission denied
    (requireDocumentPermission as any).mockRejectedValue(
      new APIError(ErrCode.PermissionDenied, "Denied")
    )

    await expect(
      DocumentsService.updateDocument(userId, docId, {} as any)
    ).rejects.toBeInstanceOf(APIError)
  })
})


//   uploadNewVersion
describe("DocumentsService.uploadNewVersion", () => {
  it("increments version", async () => {
     // mock permission granted
    (requireDocumentPermission as any).mockResolvedValue({
      id: docId,
      latestVersion: 2,
    })

    const res = await DocumentsService.uploadNewVersion(
      userId,
      docId,
      {} as any
    )

    expect(res.newVersion).toBe(3)
    expect(DocumentsRepo.createDocumentVersion).toHaveBeenCalled()
  })
})


//   softDeleteDocument
describe("DocumentsService.softDeleteDocument", () => {
  it("soft deletes document", async () => {
     // mock permission granted
    (requireDocumentPermission as any).mockResolvedValue({ id: docId })

    const res = await DocumentsService.softDeleteDocument(userId, docId)

    expect(res.success).toBe(true)
  })
})


//   getSummary
describe("DocumentsService.getSummary", () => {
  it("returns cached summary", async () => {
     // mock permission granted
    (requireDocumentPermission as any).mockResolvedValue({ id: docId })
    cache.get.mockResolvedValue({ summary: "cached" })

    const res = await DocumentsService.getSummary(userId, docId)

    expect(res.summary).toBe("cached")
  })
})


//   listDocuments
describe("DocumentsService.listDocuments", () => {
  it("returns documents when role granted", async () => {
     // mock permission granted
    (requireRole as any).mockResolvedValue({ role: "member" })

    DocumentsRepo.listDocuments.mockResolvedValue([{ id: "1" }])

    const res = await DocumentsService.listDocuments(userId, {
      organizationId: orgId,
    } as any)

    expect(res).toHaveLength(1)
  })
})


//   listDocumentVersions
describe("DocumentsService.listDocumentVersions", () => {
  it("returns versions", async () => {
     // mock permission
    (requireDocumentPermission as any).mockResolvedValue({ id: docId })

     // mock repo
    DocumentsRepo.listDocumentVersions.mockResolvedValue([{ version: 1 }])

    const res = await DocumentsService.listDocumentVersions(userId, docId)

    expect(res).toHaveLength(1)
  })
})
