//business logic
import { APIError, ErrCode } from "encore.dev/api"
import { DocumentsRepo } from "./documents.repo"
import {
  ListDocumentsInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  SearchDocumentsInput,
  UploadDocumentVersionInput,
} from "./documents.types"
import { getStorage } from "../storage"
import { cache } from "../cache/keyv"
import { requireRole } from "../shared/permissions"
import { requireDocumentPermission} from "../shared/document-permissions"
import { processDocument } from "../jobs/document.workflow"
// business logic

export const DocumentsService = {

  // get document by id , get doc, permission check, cache
  async getDocumentById(userId: string, documentId: string) {
    const cacheKey = `doc:${documentId}`
  
    const cached = await cache.get(cacheKey)
    if (cached) {
      console.log(" CACHE HIT:", cacheKey)
      return cached
    }
  
    console.log(" CACHE MISS:", cacheKey)
  
    const doc = await DocumentsRepo.getDocumentById(documentId)
    if (!doc) throw new APIError(ErrCode.NotFound, "Document not found")
  
    // permission check...
    await cache.set(cacheKey, doc)
    return doc
  },
  
  // list document
  async listDocuments(userId: string, input: ListDocumentsInput) {
    // check permission
    await requireRole({
      userId,
      organizationId: input.organizationId,
      roles: ["admin", "member"],
    })

    return DocumentsRepo.listDocuments(input)
  },

  // get list document version
  async listDocumentVersions(userId: string, documentId: string) {
    await requireDocumentPermission({
      userId,
      documentId,
      permission: "view",
    })
  
    return DocumentsRepo.listDocumentVersions(documentId)
  },

  // create document with version
  async createDocument(userId: string, input: CreateDocumentInput) {
    // check permission
    await requireRole({
      userId,
      organizationId: input.organizationId,
      roles: ["admin", "member"],
    })
    
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

    // create document version
    await DocumentsRepo.createDocumentVersion({
      documentId: doc.id,
      version: 1,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      size: input.size,
      createdAt: new Date(),
    })
  
    //  trigger workflow (NON-BLOCKING)
    // await processDocument(doc.id)
    return doc
  },
  

// storage

// get upload url
  async getUploadUrl(
    userId: string,
    input: { fileName: string; mimeType: string }
  ) {
    // chỉ cần user login
    // const storage = getStorage()
    // return storage.getUploadUrl(input)
    console.log(" getUploadUrl called:", { userId, input })
  
    const storage = getStorage()
    console.log(" Storage type:", storage.constructor.name)
    
    const result = await storage.getUploadUrl(input)
    console.log(" Upload URL result:", result)
    return {
      uploadUrl: result.uploadUrl,
      storageKey: result.storageKey,
    }
  },

// get download url
  async getDownloadUrl(userId: string, documentId: string) {
    const doc = await this.getDocumentById(userId, documentId)

    const storage = getStorage()
    return storage.getDownloadUrl({
      storageKey: doc.storageKey,
    })
  },

// update document
  async updateDocument(
    userId: string,
    documentId: string,
    input: UpdateDocumentInput
  ) {
    // check permission
    await requireDocumentPermission({
      userId,
      documentId,
      permission: "edit",
    })

    await DocumentsRepo.updateDocument(documentId, input)
    return { success: true }
  },

  // upload new version
  async uploadNewVersion(
    userId: string,
    documentId: string,
    input: UploadDocumentVersionInput
  ) {
    const doc = await requireDocumentPermission({
      userId,
      documentId,
      permission: "upload",
    })

    const nextVersion = (doc.latestVersion || 0) + 1
  
    await DocumentsRepo.createDocumentVersion({
      documentId,
      version: nextVersion,
      storageKey: input.storageKey,
      size: input.size,
      mimeType: input.mimeType,
      createdAt: new Date(),
    })
  
    await DocumentsRepo.updateDocument(documentId, {
      latestVersion: nextVersion,
      storageKey: input.storageKey,
      size: input.size,
      mimeType: input.mimeType,
      status: "processing",
    })
  
    return { success: true, newVersion: nextVersion }
  },

  // soft delete
  async softDeleteDocument(userId: string, documentId: string) {
    await requireDocumentPermission({
      userId,
      documentId,
      permission: "delete",
    })
  
    await DocumentsRepo.softDeleteDocument(documentId, userId)
    return { success: true }
  }
  ,

  // search
  async search(userId: string, input: SearchDocumentsInput) {
    // check permission
    await requireRole({
      userId,
      organizationId: input.organizationId,
      roles: ["admin", "member"],
    })
    

    return DocumentsRepo.searchDocuments(input)
  },

  // get summary
  // use cache
  async getSummary(userId: string, documentId: string) {

    // check permission
    await requireDocumentPermission({
      userId,
      documentId,
      permission: "view",
    })
    
    const cacheKey = `doc:summary:${documentId}`
    const cached = await cache.get(cacheKey)
    
    // check cache
    if(cached) {
      console.log("------SUMMARY CACHE HIT:", cacheKey)
      console.log("------ Returning summary from DB for document:", documentId)
      return cached
    }
  
    console.log("-----SUMMARY CACHE MISS: ", cacheKey)
    console.log("----- Generating summary for document:", documentId)

    const meta = await DocumentsRepo.getDocumentSummary(documentId)
    console.log("----- Retrieved metadata:", meta ? "FOUND" : "NOT FOUND")

    const result = { summary: meta?.summary ?? null }
  
    // Set cache (only if we have a summary)
    if (result.summary) {
      console.log(`-----[getSummary] Setting cache...`)
      await cache.set(cacheKey, result, 300000) // 5 minutes
      console.log(`-----SUMMARY CACHE SET: ${cacheKey}`)
    } else {
      console.log(`-----[getSummary] No summary to cache`)
    }
      return result
    }
  

}
