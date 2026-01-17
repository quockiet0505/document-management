import type { AuthData } from "./auth.types"

declare module "~encore/auth" {
  export function getAuthData(): AuthData
}

// 
// body : raw request body, api
// params : service - repo, service
// data : data in database, repo
// 

// API      → body (unknown)
// API      → input (Zod)
// Service  → Input type
// Service  → Params type
// Repo     → Data type
