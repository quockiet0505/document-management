import { z } from "zod"

export const ShareDocumentSchema = z.object({
  documentId: z.uuid(),
  userId: z.uuid(),
  permission: z.enum(["view", "edit"]),
})

export const RevokeShareSchema = z.object({
  shareId: z.uuid(),
})
