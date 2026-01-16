// app/documents/documents.service.ts
import { APIError, ErrCode } from "encore.dev/api"
import { DocumentsRepo } from "./documents.repo"
import { ListDocumentsInput  } from "./documents.types"

export const DocumentsService = {

     // List documents in an organization and folder
  async listDocuments(userId: string, input: ListDocumentsInput ) {
    // must be org member
    const member = await DocumentsRepo.isOrgMember(
      userId,
      input.organizationId
    )
    if (!member) {
      throw new APIError(
        ErrCode.PermissionDenied,
        "Not a member of this organization"
      )
    }

     const limit = input.limit ?? 20
     const offset = input.offset ?? 0

    return DocumentsRepo.listDocuments({
      userId,
      organizationId: input.organizationId,
      folderId: input.folderId,
      limit,
      offset,
    })
  },

     // Get document by id with permission checks
  async getDocument(userId: string, documentId: string) {
    const doc = await DocumentsRepo.getDocumentById(documentId)
    if (!doc) {
      throw new APIError(ErrCode.NotFound, "Document not found")
    }

    // owner
    if (doc.ownerId === userId) {
      return doc
    }

    // org member
    const member = await DocumentsRepo.isOrgMember(
      userId,
      doc.organizationId
    )
    if (member) {
      return doc
    }

    // shared
    const share = await DocumentsRepo.getSharePermission(userId, doc.id)
    if (share) {
      return doc
    }

    throw new APIError(
      ErrCode.PermissionDenied,
      "No permission to access document"
    )
  },
}
