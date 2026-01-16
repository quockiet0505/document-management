// app/documents/documents.api.ts
import { api } from "encore.dev/api"
import { getAuthData } from "~encore/auth"
import { DocumentsService } from "./documents.service"
import {
  ListDocumentsSchema,
  GetDocumentSchema,
} from "./documents.schema"

// POST /v1/documents
export const listDocuments = api(
  { method: "POST", path: "/v1/documents", auth: true },
  async (body: unknown) => {
    const input = ListDocumentsSchema.parse(body)
    const auth = getAuthData()

    return DocumentsService.listDocuments(auth.userID, input)
  }
)

// GET /v1/documents/:id
export const getDocument = api(
  { method: "GET", path: "/v1/documents/:id", auth: true },
  async (params: { id: string }) => {
    const input = GetDocumentSchema.parse(params)
    const auth = getAuthData()

    return DocumentsService.getDocument(auth.userID, input.id)
  }
)
