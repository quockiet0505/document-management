// validate runtime
import { z } from "zod"

export const ListDocumentsSchema = z.object({
  organizationId: z.uuid(),
  folderId: z.uuid().optional(),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
})

export const GetDocumentSchema = z.object({
  id: z.uuid(),
})


