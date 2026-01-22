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
import { invalidateDocumentCache } from "../cache/helper"

import { requireRole } from "../shared/permissions"
import { requireDocumentPermission} from "../shared/document-permissions"
import { processDocument } from "../jobs/document.workflow"

import { canUpload, canSummary, canConvertToDocx } from "./document-capabilities"
import { convertPdfToDocxFromBuffer } from "../external/pdf.convert"
import { downloadFileAsBuffer } from "../external/file.helper"

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
  input: { fileName: string; mimeType: string; size?: number }
) {
  if (!canUpload(input.mimeType, input.size)) {
    throw new APIError(
      ErrCode.InvalidArgument,
      "File type or size is not allowed"
    )
  }
  const storage = getStorage()
  return storage.getUploadUrl(input)
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

    // delete cache
    await invalidateDocumentCache(documentId)
    
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

    // check mime type
    if (!canUpload(input.mimeType, input.size)) {
      throw new APIError(
        ErrCode.InvalidArgument,
        "This file type is not allowed to upload"
      )
    }

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

    // invalidate cache
    await invalidateDocumentCache(documentId)
  
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

    // invalidate cache
    await invalidateDocumentCache(documentId)

    return { success: true }
  },

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
    const doc = await requireDocumentPermission({
      userId,
      documentId,
      permission: "view",
    })

    // check mime type support 
    if (!canSummary(doc.mimeType)) {
      throw new APIError(
        ErrCode.InvalidArgument,
        "This file type does not support summary"
      )
    }
    
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
    },

    // convert document
    async convertDocument(userId: string, documentId: string) {
      const doc = await requireDocumentPermission({
        userId,
        documentId,
        permission: "edit",
      })
    
      if (doc.mimeType !== "application/pdf") {
        throw new APIError(
          ErrCode.InvalidArgument,
          "Only PDF can be converted"
        )
      }
    
      //  Lấy PDF từ S3
      const { downloadUrl } = await getStorage().getDownloadUrl({
        storageKey: doc.storageKey,
      })
    
      const pdfBuffer = await downloadFileAsBuffer(downloadUrl)
    
      //  Convert
      const docxBuffer = await convertPdfToDocxFromBuffer(
        pdfBuffer,
        `${doc.name}.pdf`
      )
    
      //  Upload DOCX
      const storage = getStorage()
      const { storageKey } = await storage.uploadBuffer({
        buffer: docxBuffer,
        fileName: `${doc.name}.docx`,
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    
      //  Update DB
      await DocumentsRepo.updateDocument(documentId, {
        convertedStorageKey: storageKey,
        convertedMimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        convertedAt: new Date(),
        status: "ready",
      })
    
      // invalidate cache
      await invalidateDocumentCache(documentId)

      return {
        success: true,
        storageKey,
      }
    },
    
    // download document convert
    async downloadConvertedDocument(userId: string, documentId: string) {
      const doc = await requireDocumentPermission({
        userId,
        documentId,
        permission: "view",
      })
    
      if (!doc.convertedStorageKey) {
        throw new APIError(
          ErrCode.NotFound,
          "Document has not been converted yet"
        )
      }
    
      const storage = getStorage()
      return storage.getDownloadUrl({
        storageKey: doc.convertedStorageKey,
      })
    }
    
  }