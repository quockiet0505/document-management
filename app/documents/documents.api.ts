// API documents endpoints
import { api } from "encore.dev/api"
import { getAuthData } from "~encore/auth"
import { DocumentsService } from "./documents.service"
import {
  ListDocumentsSchema,
  UploadDocumentSchema,
  UpdateDocumentSchema,
  SearchDocumentsSchema,
} from "./documents.schema"

// list
export const listDocuments = api(
  { method: "POST", path: "/v1/documents", auth: true },
  async (body: unknown) => {
    const input = ListDocumentsSchema.parse(body)
    const auth = getAuthData()
    return DocumentsService.listDocuments(auth.userID, input)
  }
)

// get
export const getDocument = api(
  { method: "GET", path: "/v1/documents/:id", auth: true },
  async ({ id }: { id: string }) => {
    const auth = getAuthData()
    return DocumentsService.getDocumentById(auth.userID, id)
  }
)

// upload
export const uploadDocument = api(
  { method: "POST", path: "/v1/documents/upload", auth: true },
  async (body: unknown) => {
    const input = UploadDocumentSchema.parse(body)
    const auth = getAuthData()
    return DocumentsService.uploadDocument(auth.userID, input)
  }
)

// update
export const updateDocument = api(
  { method: "PUT", path: "/v1/documents/:id", auth: true },
  async ({ id, ...body }: any) => {
    const input = UpdateDocumentSchema.parse(body)
    const auth = getAuthData()
    return DocumentsService.updateDocument(auth.userID, id, input)
  }
)

// delete soft
export const softDeleteDocument = api(
  { method: "DELETE", path: "/v1/documents/:id", auth: true },
  async ({ id }: { id: string }) => {
    const auth = getAuthData()
    return DocumentsService.softDeleteDocument(auth.userID, id)
  }
)

// search
export const searchDocuments = api(
  { method: "POST", path: "/v1/documents/search", auth: true },
  async (body: unknown) => {
    const input = SearchDocumentsSchema.parse(body)
    const auth = getAuthData()
    return DocumentsService.search(auth.userID, input)
  }
)
