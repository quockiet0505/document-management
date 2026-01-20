import { describe, it, expect, vi } from "vitest"
import { SharesService } from "../app/shares/share.service"
import { DocumentsRepo } from "../app/documents/documents.repo"
import { SharesRepo } from "../app/shares/share.repo"
import { mockUserId, mockDocId } from "./helpers"

vi.mock("../app/documents/documents.repo")
vi.mock("../app/shares/share.repo")

describe("SharesService", () => {
  it("shareDocument: owner can share", async () => {
    vi.spyOn(DocumentsRepo, "getDocumentById").mockResolvedValue({
      id: mockDocId,
      ownerId: mockUserId,
      organizationId: "org",
    } as any)

    vi.spyOn(SharesRepo, "createShare").mockResolvedValue({ id: "share-id" } as any)

    const result = await SharesService.shareDocument(mockUserId, {
      documentId: mockDocId,
      userId: "other-user",
      permission: "view",
    })

    expect(result).toBeDefined()
  })
})
