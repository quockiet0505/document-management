// api endpoint
import { api } from "encore.dev/api"
import { getAuthData } from "~encore/auth"
import { SharesService } from "./share.service"
import {
  ShareDocumentSchema,
  RevokeShareSchema,
} from "./share.schema"

// share document
export const shareDocument = api(
  { method: "POST", path: "/v1/documents/:id/share", auth: true },
  async (body: unknown) => {
    const input = ShareDocumentSchema.parse(body)
    const auth = getAuthData()

    return SharesService.shareDocument(auth.userID, input)
  }
)

// revoke share
export const revokeShare = api(
  { method: "DELETE", path: "/v1/shares/:id", auth: true },
  async (_: unknown) => {
    const input = RevokeShareSchema.parse(_)
    const auth = getAuthData()
    return SharesService.revokeShare(auth.userID, input.shareId)
  }
)

// list documents shared with me
export const listSharedDocuments = api(
  { method: "GET", path: "/v1/shares/my-documents", auth: true },
  async () => {
    const auth = getAuthData()
    return SharesService.listSharedWithMe(auth.userID)
  }
)
