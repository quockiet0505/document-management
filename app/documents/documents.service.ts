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
import { processDocument } from "../jobs/document.workflow"
import { listDocumentVersions } from "./documents.api"
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

  // get list document version
  async listDocumentVersions(userId: string, documentId: string){
    return DocumentsRepo.listDocumentVersions(documentId)
  },

  // get document by id 
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
  

  // create document with version
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

  async getDownloadUrl(userId: string, documentId: string) {
    const doc = await this.getDocumentById(userId, documentId)

    const storage = getStorage()
    return storage.getDownloadUrl({
      storageKey: doc.storageKey,
    })
  },

// update 
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

  // upload new version
  async uploadNewVersion(userId: string, documentId: string, input: UploadDocumentVersionInput){
      const doc = await this.getDocumentById(userId, documentId)

      // check doc
      if(!doc){
        throw new APIError(ErrCode.NotFound, "Document not found")
      }

      // check permission
      // only owner or admin can upload new version
      const member = await DocumentsRepo.isOrgMember(userId, doc.organizationId )
      if (doc.ownerId != userId && member?.role != "admin"){
          throw new APIError(ErrCode.PermissionDenied, "Cannot upload new version")
        }

      // next version
      const nextVersion = doc.latestVersion +1
      // create new version

      await DocumentsRepo.createDocumentVersion({
        documentId: doc.id,
        version: nextVersion,
        storageKey: input.storageKey,
        size: input.size,
        mimeType: input.mimeType,
        createdAt: new Date(),
      })

      // update latest version in document
      await DocumentsRepo.updateDocument(documentId, {
        latestVersion: nextVersion,
        storageKey: input.storageKey,
        size: input.size,
        mimeType: input.mimeType,
        status: "processing",
      })

      // await processDocument(doc.id)

      return { success: true, newVersion: nextVersion}

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
    
    // check cache
    if(cached) {
      console.log("------SUMMARY CACHE HIT:", cacheKey)
      console.log("------ Fetching summary from DB for document:", documentId)
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
