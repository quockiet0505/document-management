import { api } from "encore.dev/api"
import { AuthService } from "./auth.service"
import { RegisterSchema, LoginSchema } from "./auth.schema"

import { RegisterRequest, LoginRequest } from "./auth.types"

// register
export const register = api(
  { expose: true, method: "POST", path: "/v1/auth/register" },
  async (req: RegisterRequest): Promise<{ userId: string; token: string }> => {
    const input = RegisterSchema.parse(req)
    return AuthService.register(input)
  }
)

// login
export const login = api(
  { expose: true, method: "POST", path: "/v1/auth/login" },
  async (req: LoginRequest): Promise<{ userId: string; token: string }> => {
    const input = LoginSchema.parse(req)
    return AuthService.login(input)
  }
)
