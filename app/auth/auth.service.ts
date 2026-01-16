// business
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { APIError, ErrCode } from "encore.dev/api"
import { AuthRepo } from "./auth.repo"
import type { RegisterInput, LoginInput } from "./auth.types"
import { secret } from "encore.dev/config"

const AUTH_SECRET = secret("AUTH_SECRET")

export const AuthService = {

  // register for user
  async register(input: RegisterInput) {
    const existing = await AuthRepo.findUserByEmail(input.email)
    if (existing) {
      throw new APIError(ErrCode.AlreadyExists, "Email already exists")
    }

    const passwordHash = await bcrypt.hash(input.password, 10)

    const user = await AuthRepo.createUser({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
    })

    const token = jwt.sign(
      { userID: user.id },
      AUTH_SECRET(),
      { expiresIn: "7d" }
    )

    return {
      userId: user.id,
      token,
    }
  },

  // login for user
  async login(input: LoginInput) {
    const user = await AuthRepo.findUserByEmail(input.email)
    if (!user) {
      throw new APIError(
        ErrCode.Unauthenticated,
        "Invalid email or password"
      )
    }

//     compare password
    const ok = await bcrypt.compare(input.password, user.passwordHash)
    if (!ok) {
      throw new APIError(
        ErrCode.Unauthenticated,
        "Invalid email or password"
      )
    }

    const token = jwt.sign(
      { userID: user.id },
      AUTH_SECRET(),
      { expiresIn: "7d" }
    )

    return {
      userId: user.id,
      token,
    }
  },
}
