// service input

export interface ListDocumentsInput {
  organizationId: string
  folderId?: string
  limit: number
  offset: number
}

// create document metadata (after upload)
export interface CreateDocumentInput {
  organizationId: string
  folderId?: string
  name: string
  mimeType: string
  size: number
  storageKey: string
}

export interface UpdateDocumentInput {
  name?: string
  folderId?: string
}

export interface SearchDocumentsInput {
  organizationId: string
  keyword: string
  limit: number
  offset: number
}

// api request interfaces
export interface ListDocumentsRequest {
  organizationId: string
  folderId?: string
  limit: number
  offset: number
}

export interface CreateDocumentRequest {
  organizationId: string
  folderId?: string
  name: string
  mimeType: string
  size: number
  storageKey: string
}

export interface SearchDocumentsRequest {
  organizationId: string
  keyword: string
  limit: number
  offset: number
}

// get api /documents/:id
export interface IdRequest {
  id: string
}

// PUT /documents/:id
export interface UpdateDocumentRequest extends UpdateDocumentInput {
  id: string
}

// POST /documents/upload-url
export interface GetUploadUrlRequest {
  fileName: string
  mimeType: string
}

// repo params

export interface ListDocumentsParams {
  organizationId: string
  folderId?: string
  limit: number
  offset: number
}

export interface CreateDocumentData {
  organizationId: string
  folderId?: string
  name: string
  mimeType: string
  size: number
  storageKey: string
  ownerId: string
  status: "processing" | "ready" | "error"
  latestVersion: number
  createdAt: Date
}
