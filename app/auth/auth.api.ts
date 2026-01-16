import { api } from "encore.dev/api"
import { AuthService } from "./auth.service"
import type { RegisterInput, LoginInput } from "./auth.types"
import { RegisterSchema, LoginSchema } from "./auth.schema"

// register
export const register = api<RegisterInput,{ userId: string; token: string }>(
  { expose: true, method: "POST", path: "/v1/auth/register" },
  async (body) => {
    const input = RegisterSchema.parse(body)
    return AuthService.register(input)
  }
)

// login
export const login = api<LoginInput,{ userId: string; token: string }>(
  { expose: true, method: "POST", path: "/v1/auth/login" },
  async (body) => {
    const input = LoginSchema.parse(body)
    return AuthService.login(input)
  }
)
