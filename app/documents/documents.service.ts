// permission and business logic
import { APIError, ErrCode } from "encore.dev/api"
import { DocumentsRepo } from "./documents.repo"
import {
  ListDocumentsInput,
  UploadDocumentInput,
  UpdateDocumentInput,
  SearchDocumentsInput,
} from "./documents.types"

// business logic
export const DocumentsService = {
  async listDocuments(userId: string, input: ListDocumentsInput) {
    const member = await DocumentsRepo.isOrgMember(
      userId,
      input.organizationId
    )
    if (!member) {
      throw new APIError(ErrCode.PermissionDenied, "Not org member")
    }

    return DocumentsRepo.listDocuments(input)
  },

  // get document by id with permission check
  async getDocumentById(userId: string, documentId: string) {
    const doc = await DocumentsRepo.getDocumentById(documentId)
    if (!doc) throw new APIError(ErrCode.NotFound, "Document not found")

    if (doc.ownerId === userId) return doc

    const member = await DocumentsRepo.isOrgMember(
      userId,
      doc.organizationId
    )
    if (member) return doc

    const shared = await DocumentsRepo.getSharePermission(userId, doc.id)
    if (shared) return doc

    throw new APIError(ErrCode.PermissionDenied, "No access")
  },


  // upload document
  async uploadDocument(
    userId: string,
    input: UploadDocumentInput
  ) {
    const member = await DocumentsRepo.isOrgMember(
      userId,
      input.organizationId
    )
  
    if (!member) {
      throw new APIError(
        ErrCode.PermissionDenied,
        "Not organization member"
      )
    }
  
    return DocumentsRepo.createDocument({
      organizationId: input.organizationId,
      folderId: input.folderId,
      name: input.name,
      mimeType: input.mimeType,
      size: input.size,
      storageKey: input.storageKey,
  
      ownerId: userId,
      status: "processing",
      latestVersion: 1,
      createdAt: new Date(),
    })
  },

  // update document metadata
  async updateDocument(userId: string, documentId: string, input: UpdateDocumentInput) {
    const doc = await DocumentsRepo.getDocumentById(documentId)
    if (!doc) throw new APIError(ErrCode.NotFound, "Document not found")

      if (doc.ownerId !== userId) {
        const member = await DocumentsRepo.isOrgMember(
          userId,
          doc.organizationId
        )
        const share = await DocumentsRepo.getSharePermission(
          userId,
          doc.id
        )
  
        if (
          member?.role !== "admin" &&
          share?.permission !== "edit"
        ) {
          throw new APIError(
            ErrCode.PermissionDenied,
            "Cannot update document"
          )
        }
      }

    await DocumentsRepo.updateDocument(documentId, input)
    return { success: true }
  },

  // soft delete document
  async softDeleteDocument(userId: string, documentId: string) {
    const doc = await DocumentsRepo.getDocumentById(documentId)
    if (!doc) {
      throw new APIError(ErrCode.NotFound, "Document not found")
    }

    const member = await DocumentsRepo.isOrgMember(
      userId,
      doc.organizationId
    )

    if (
      doc.ownerId !== userId &&
      member?.role !== "admin"
    ) {
      throw new APIError(
        ErrCode.PermissionDenied,
        "Cannot delete document"
      )
    }

    await DocumentsRepo.softDeleteDocument(
      documentId,
      userId
    )

    return { success: true }
  },


  // search documents
  async search(userId: string, input: SearchDocumentsInput) {
    const member = await DocumentsRepo.isOrgMember(
      userId,
      input.organizationId
    )
    if (!member) throw new APIError(ErrCode.PermissionDenied, "Not org member")

    return DocumentsRepo.searchDocuments(input)
  },
}
