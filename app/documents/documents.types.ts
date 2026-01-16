
export type DocumentStatus = "processing" | "ready" | "error"

export type DocumentPermission = "owner" | "member" | "shared:view" | "shared:edit"

export interface DocumentItem {
  id: string
  name: string
  mimeType: string
  size: number
  status: DocumentStatus
  latestVersion: number
  folderId?: string | null
  organizationId: string
  ownerId: string
  createdAt: Date
  updatedAt?: Date | null
}


export interface ListDocumentsInput {
     organizationId: string
     folderId?: string
     limit?: number
     offset?: number
   }
   
   export interface GetDocumentInput {
     documentId: string
   }
   