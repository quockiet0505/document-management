// app/documents/documents.api.ts
import { api } from "encore.dev/api"
import { getAuthData } from "~encore/auth"
import { DocumentsService } from "./documents.service"
import { initDBOS } from "../../app/index"
initDBOS()

import {
  ListDocumentsSchema,
  CreateDocumentSchema,
  UpdateDocumentSchema,
  SearchDocumentsSchema,
  GetUploadUrlSchema,
  UploadDocumentVersionSchema
} from "./documents.schema"

import {
  ListDocumentsRequest,
  CreateDocumentRequest,
  SearchDocumentsRequest,
  IdRequest,
  UpdateDocumentRequest,
  GetUploadUrlRequest,
  UploadDocumentVersionRequest
} from "./documents.types"


// list
export const listDocuments = api(
  { method: "POST", path: "/v1/documents", auth: true },
  async (req: ListDocumentsRequest) => {
    const input = ListDocumentsSchema.parse(req)
    const auth = getAuthData()
    return DocumentsService.listDocuments(auth.userID, input)
  }
)

// get by id
export const getDocument = api(
  { method: "GET", path: "/v1/documents/:id", auth: true },
  async (req: IdRequest) => {
    const auth = getAuthData()
    return DocumentsService.getDocumentById(auth.userID, req.id)
  }
)

// create metadata
export const createDocument = api(
  { method: "POST", path: "/v1/documents/create", auth: true },
  async (req: CreateDocumentRequest) => {
    const input = CreateDocumentSchema.parse(req)
    const auth = getAuthData()
    return DocumentsService.createDocument(auth.userID, input)
  }
)

// get upload url
export const getUploadUrl = api(
  { method: "POST", path: "/v1/documents/upload-url", auth: true },
  async (req: GetUploadUrlRequest) => {
    const input = GetUploadUrlSchema.parse(req)
    const auth = getAuthData()
    return DocumentsService.getUploadUrl(auth.userID, input)
  }
)

// download
export const downloadDocument = api(
  { method: "GET", path: "/v1/documents/:id/download", auth: true },
  async (req: IdRequest) => {
    const auth = getAuthData()
    return DocumentsService.getDownloadUrl(auth.userID, req.id)
  }
)

// update
export const updateDocument = api(
  { method: "PUT", path: "/v1/documents/:id", auth: true },
  async (req: UpdateDocumentRequest) => {
    const { id, ...body } = req
    const input = UpdateDocumentSchema.parse(body)
    const auth = getAuthData()
    return DocumentsService.updateDocument(auth.userID, id, input)
  }
)

// update document version
export const uploadNewVersion = api(
  { method: "POST", path: "/v1/documents/:id/upload-new-version", auth: true},
  async (req: UploadDocumentVersionRequest) =>{
    const input = UploadDocumentVersionSchema.parse(req)
    const auth = getAuthData()

    return DocumentsService.uploadNewVersion(auth.userID, req.id, input)
  }
)

// export list document versions
export const listDocumentVersions = api(
  { method: "GET", path: "/v1/documents/:id/versions", auth:true},
  async (req: IdRequest) =>{
    const auth = getAuthData()

    return DocumentsService.listDocumentVersions(auth.userID, req.id)
  }
)

// soft delete
export const deleteDocument = api(
  { method: "DELETE", path: "/v1/documents/:id", auth: true },
  async (req: IdRequest) => {
    const auth = getAuthData()
    return DocumentsService.softDeleteDocument(auth.userID, req.id)
  }
)

// search
export const searchDocuments = api(
  { method: "POST", path: "/v1/documents/search", auth: true },
  async (req: SearchDocumentsRequest) => {
    const input = SearchDocumentsSchema.parse(req)
    const auth = getAuthData()
    return DocumentsService.search(auth.userID, input)
  }
)

// summary
export const getDocumentSummary = api(
  { method: "GET", path: "/v1/documents/:id/summary", auth: true },
  async (req: IdRequest) => {
    const auth = getAuthData()
    return DocumentsService.getSummary(auth.userID, req.id)
  }
)
