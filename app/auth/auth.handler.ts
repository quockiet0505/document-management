import { authHandler } from "encore.dev/auth"
import { Header, APIError, ErrCode } from "encore.dev/api"
import jwt from "jsonwebtoken"
import { AuthRepo } from "./auth.repo"
import { secret } from "encore.dev/config"

export interface AuthParams {
  authorization: Header<"Authorization">
}

const AUTH_SECRET = secret("AUTH_SECRET")

export const authHandlerInstance = authHandler<
  AuthParams,
  { userID: string }
>(async ({ authorization }) => {
  if (!authorization) {
    throw new APIError(ErrCode.Unauthenticated, "Missing Authorization header")
  }

  const token = authorization.replace("Bearer ", "")
  let payload: any

  try {
    payload = jwt.verify(token, AUTH_SECRET())
  } catch {
    throw new APIError(ErrCode.Unauthenticated, "Invalid or expired token")
  }

  const user = await AuthRepo.findUserById(payload.userID)
  if (!user) {
    throw new APIError(ErrCode.Unauthenticated, "User not found")
  }

  return { userID: user.id }
})
