import type { AuthData } from "./auth.types"

declare module "~encore/auth" {
  export function getAuthData(): AuthData
}
