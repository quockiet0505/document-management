// check permission
import { APIError, ErrCode } from "encore.dev/api"
import { SharesRepo } from "./share.repo"
import { DocumentsRepo } from "../documents/documents.repo"
import { ShareDocumentInput } from "./share.types"

export const SharesService = {
  async shareDocument(
    actorUserId: string,
    input: ShareDocumentInput
  ) {
    const doc = await DocumentsRepo.getDocumentById(input.documentId)
    if (!doc) {
      throw new APIError(ErrCode.NotFound, "Document not found")
    }

    // owner or org admin only
    if (doc.ownerId !== actorUserId) {
      const member = await DocumentsRepo.isOrgMember(
        actorUserId,
        doc.organizationId
      )

      if (member?.role !== "admin") {
        throw new APIError(
          ErrCode.PermissionDenied,
          "Cannot share this document"
        )
      }
    }

    return SharesRepo.createShare({
      documentId: input.documentId,
      sharedWithUserId: input.userId,
      permission: input.permission,
    })
  },

//   
  async revokeShare(actorUserId: string, shareId: string) {
    const share = await SharesRepo.findShareById(shareId)
    if (!share) {
      throw new APIError(ErrCode.NotFound, "Share not found")
    }

    const doc = await DocumentsRepo.getDocumentById(share.documentId)
    if (!doc || doc.ownerId !== actorUserId) {
      throw new APIError(
        ErrCode.PermissionDenied,
        "Cannot revoke share"
      )
    }

    await SharesRepo.deleteShare(shareId)
    return { success: true }
  },

//   list shares shared with me
  async listSharedWithMe(userId: string) {
    return SharesRepo.listSharedWithUser(userId)
  },
}
