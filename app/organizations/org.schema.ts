//  check validation
import { z } from "zod"

export const CreateOrgSchema = z.object({
     nameOrg: z.string().min(2),
})

// add member
export const AddMemberSchema = z.object({
     userId: z.string().min(1),
     role: z.enum(["admin", "member"]).default("member"),
     organizationId: z.string().min(1),
}
)