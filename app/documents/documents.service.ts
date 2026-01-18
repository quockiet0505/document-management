// app/documents/documents.service.ts
import { APIError, ErrCode } from "encore.dev/api"
import { DocumentsRepo } from "./documents.repo"
import {
  ListDocumentsInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  SearchDocumentsInput,
} from "./documents.types"
import { getStorage } from "../storage"
import { cache } from "../cache/keyv"
import { processDocument } from "../jobs/document.workflow"
// business logic

export const DocumentsService = {
  // list
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

  // get document with permission
  // async getDocumentById(userId: string, documentId: string) {
  //   const doc = await DocumentsRepo.getDocumentById(documentId)
  //   if (!doc) throw new APIError(ErrCode.NotFound, "Document not found")

  //   if (doc.ownerId === userId) return doc

  //   const member = await DocumentsRepo.isOrgMember(
  //     userId,
  //     doc.organizationId
  //   )
  //   if (member) return doc

  //   const shared = await DocumentsRepo.getSharePermission(userId, doc.id)
  //   if (shared) return doc

  //   throw new APIError(ErrCode.PermissionDenied, "No access")
  // },
  async getDocumentById(userId: string, documentId: string) {
    const cacheKey = `doc:${documentId}`
  
    const cached = await cache.get(cacheKey)
    if (cached) return cached
  
    const doc = await DocumentsRepo.getDocumentById(documentId)
    if (!doc) throw new APIError(ErrCode.NotFound, "Document not found")
  
    // permission check 
    if (doc.ownerId !== userId) {
      const member = await DocumentsRepo.isOrgMember(userId, doc.organizationId)
      const shared = await DocumentsRepo.getSharePermission(userId, doc.id)
  
      if (!member && !shared) {
        throw new APIError(ErrCode.PermissionDenied, "No access")
      }
    }
  
    await cache.set(cacheKey, doc)
    return doc
  },

// create document
  // async createDocument(userId: string, input: CreateDocumentInput) {
  //   const member = await DocumentsRepo.isOrgMember(
  //     userId,
  //     input.organizationId
  //   )
  //   if (!member) {
  //     throw new APIError(
  //       ErrCode.PermissionDenied,
  //       "Not organization member"
  //     )
  //   }

  //   return DocumentsRepo.createDocument({
  //     ...input,
  //     ownerId: userId,
  //     status: "processing", // workflow 
  //     latestVersion: 1,
  //     createdAt: new Date(),
  //   })
  // },
  async createDocument(userId: string, input: CreateDocumentInput) {
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
  
    //  tạo document
    const doc = await DocumentsRepo.createDocument({
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
  
    //  trigger workflow (NON-BLOCKING)
    await processDocument( doc.id)
  
    return doc
  },
  

// storage
  async getUploadUrl(
    userId: string,
    input: { fileName: string; mimeType: string }
  ) {
    // chỉ cần user login
    const storage = getStorage()
    return storage.getUploadUrl(input)
  },

  async getDownloadUrl(userId: string, documentId: string) {
    const doc = await this.getDocumentById(userId, documentId)

    const storage = getStorage()
    return storage.getDownloadUrl({
      storageKey: doc.storageKey,
    })
  },

// update and delete
  async updateDocument(
    userId: string,
    documentId: string,
    input: UpdateDocumentInput
  ) {
    const doc = await this.getDocumentById(userId, documentId)

    if (doc.ownerId !== userId) {
      const member = await DocumentsRepo.isOrgMember(
        userId,
        doc.organizationId
      )
      const share = await DocumentsRepo.getSharePermission(userId, doc.id)

      if (member?.role !== "admin" && share?.permission !== "edit") {
        throw new APIError(
          ErrCode.PermissionDenied,
          "Cannot update document"
        )
      }
    }

    await DocumentsRepo.updateDocument(documentId, input)
    return { success: true }
  },

  // soft delete
  async softDeleteDocument(userId: string, documentId: string) {
    const doc = await this.getDocumentById(userId, documentId)

    const member = await DocumentsRepo.isOrgMember(
      userId,
      doc.organizationId
    )

    if (doc.ownerId !== userId && member?.role !== "admin") {
      throw new APIError(
        ErrCode.PermissionDenied,
        "Cannot delete document"
      )
    }

    await DocumentsRepo.softDeleteDocument(documentId, userId)
    return { success: true }
  },

  // search
  async search(userId: string, input: SearchDocumentsInput) {
    const member = await DocumentsRepo.isOrgMember(
      userId,
      input.organizationId
    )
    if (!member) {
      throw new APIError(ErrCode.PermissionDenied, "Not org member")
    }

    return DocumentsRepo.searchDocuments(input)
  },

  // get summary
  // use cache

  async getSummary(userId: string, documentId: string) {
    await this.getDocumentById(userId, documentId)
  
    const cacheKey = `doc:summary:${documentId}`
    const cached = await cache.get(cacheKey)
    if (cached) return cached
  
    const meta = await DocumentsRepo.getDocumentSummary(documentId)
    const result = { summary: meta?.summary ?? null }
  
    await cache.set(cacheKey, result)
    return result
  }
  

}
