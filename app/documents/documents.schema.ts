// check validation 
import { z } from "zod"

// list
export const ListDocumentsSchema = z.object({
  organizationId: z.uuid(),
  folderId: z.uuid().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
})

export const UploadDocumentSchema = z.object({
  organizationId: z.uuid(),
  folderId: z.uuid().optional(),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(1),
  storageKey: z.string(),
})

export const UpdateDocumentSchema = z.object({
  name: z.string().min(1).optional(),
  folderId: z.uuid().optional(),
})

export const SearchDocumentsSchema = z.object({
  organizationId: z.uuid(),
  keyword: z.string().min(1),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
})
