// validation
import { z } from "zod"

export const ListFoldersSchema = z.object({
     organizationId: z.uuid(),
})

export const CreateFolderSchema = z.object({
     organizationId: z.uuid(),
     name: z.string().min(1)
})

export const UpdateFolderSchema = z.object({
     name: z.string().min(1).optional(),
})