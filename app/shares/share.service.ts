// check permission
import { APIError, ErrCode } from "encore.dev/api"
import { SharesRepo } from "./share.repo"
import { DocumentsRepo } from "../documents/documents.repo"
import { ShareDocumentInput } from "./share.types"

// SharesService.ts
import { requireDocumentPermission } from "../shared/document-permissions"

export const SharesService = {
  async shareDocument(
    actorUserId: string,
    input: ShareDocumentInput
  ) {
    await requireDocumentPermission({
      userId: actorUserId,
      documentId: input.documentId,
      permission: "delete", // owner or admin
    })

    await SharesRepo.createShare({
      documentId: input.documentId,
      sharedWithUserId: input.userId,
      permission: input.permission, // view | edit
    })

    return { success: true }
  },

//  delete share 
  async revokeShare(actorUserId: string, shareId: string) {
    const share = await SharesRepo.findShareById(shareId)
    if (!share) {
      throw new APIError(ErrCode.NotFound, "Share not found")
    }

    await requireDocumentPermission({
      userId: actorUserId,
      documentId: share.documentId,
      permission: "delete",
    })

    await SharesRepo.deleteShare(shareId)
    return { success: true }
  },

//   list shares shared with me
  async listSharedWithMe(userId: string) {
    return SharesRepo.listSharedWithUser(userId)
  },
}
