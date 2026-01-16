//  validation schema zod
import { z} from "zod"

export const RegisterSchema = z.object({
     email: z.email(),
     password: z.string().min(8),
     fullName: z.string().min(2),
     phone: z.string().optional(),
})

export const LoginSchema = z.object({
     email: z.email(),
     password: z.string().min(8)
})

