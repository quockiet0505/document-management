// app/shared/document-permissions.ts
import { APIError, ErrCode } from "encore.dev/api"
import { DocumentsRepo } from "../documents/documents.repo"
import { AuthRepo } from "../auth/auth.repo"

export type DocumentPermission = "view" | "edit" | "upload" | "delete"

export async function requireDocumentPermission(params: {
  userId: string
  documentId: string
  permission: DocumentPermission
}) {
  const { userId, documentId, permission } = params

  const doc = await DocumentsRepo.getDocumentById(documentId)
  if (!doc) {
    throw new APIError(ErrCode.NotFound, "Document not found")
  }

  //  Owner => full quyền
  if (doc.ownerId === userId) {
    return doc
  }

  //  Org admin => full quyền
  const member = await AuthRepo.getMembershipByOrg(
    userId,
    doc.organizationId
  )

  if (member?.role === "admin") {
    return doc
  }

  // Share permission
  const share = await DocumentsRepo.getSharePermission(userId, documentId)

  const permissionMap: Record<DocumentPermission, string[]> = {
    view: ["view", "edit"],
    edit: ["edit"],
    upload: [], // only owner/admin
    delete: [], // only owner/admin
  }

  if (!share || !permissionMap[permission].includes(share.permission)) {
    throw new APIError(
      ErrCode.PermissionDenied,
      "Insufficient document permission"
    )
  }

  return doc
}
