// app/shares/share.api.ts
import { api } from "encore.dev/api"
import { getAuthData } from "~encore/auth"
import { SharesService } from "./share.service"
import {
  ShareDocumentSchema,
  RevokeShareSchema,
} from "./share.schema"

import {
  ShareDocumentRequest,
  RevokeShareRequest,
} from "./share.types"


// share document
export const shareDocument = api(
  { method: "POST", path: "/v1/documents/:id/share", auth: true },
  async (req: ShareDocumentRequest) => {
    const auth = getAuthData()

    const input = ShareDocumentSchema.parse({
      documentId: req.id,        //  map path param
      userId: req.userId,
      permission: req.permission,
    })

    return SharesService.shareDocument(auth.userID, input)
  }
)

// revoke share
export const revokeShare = api(
  { method: "DELETE", path: "/v1/shares/:id", auth: true },
  async (req: RevokeShareRequest) => {
    const auth = getAuthData()

    const input = RevokeShareSchema.parse({
      shareId: req.id,           //  map path param
    })

    return SharesService.revokeShare(auth.userID, input.shareId)
  }
)

// list shared documents
export const listSharedDocumentsWithMe = api(
  { method: "GET", path: "/v1/shares/my-documents", auth: true },
  async () => {
    const auth = getAuthData()
    return SharesService.listSharedWithMe(auth.userID)
  }
)
