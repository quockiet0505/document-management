// types

// SERVICE INPUTS 
export interface ListDocumentsInput {
  organizationId: string
  folderId?: string
  limit: number
  offset: number
}

export interface UploadDocumentInput {
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

// PARAMS 
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
