import { vi, describe, it, expect, beforeEach } from "vitest"
import { APIError, ErrCode } from "encore.dev/api"

// mock permission
vi.mock("../../app/shared/document-permissions", () => ({
  requireDocumentPermission: vi.fn(),
}))

// mock SharesRepo 
vi.mock("../../app/shares/share.repo", async () => {
  const mod = await import("../mocks/share.repo")
  return mod
})

import { SharesService } from "../../app/shares/share.service"
import { SharesRepo } from "../mocks/share.repo"
import { requireDocumentPermission } from "../../app/shared/document-permissions"

// common test data
const actorUserId = "user-1"
const targetUserId = "user-2"
const documentId = "doc-1"
const shareId = "share-1"

beforeEach(() => {
     Object.values(SharesRepo).forEach(fn => fn.mockReset());
     (requireDocumentPermission as any).mockReset()
})
   

// share document
describe("SharesService.shareDocument", () => {
     it("throws when permission denied", async () => {
       ;(requireDocumentPermission as any).mockRejectedValue(
         new APIError(ErrCode.PermissionDenied, "Denied")
       )
   
       await expect(
         SharesService.shareDocument(actorUserId, {
           documentId,
           userId: targetUserId,
           permission: "view",
         } as any)
       ).rejects.toBeInstanceOf(APIError)
   
       expect(SharesRepo.createShare).not.toHaveBeenCalled()
     })
   
     it("creates share when permission granted", async () => {
       ;(requireDocumentPermission as any).mockResolvedValue({})
   
       const res = await SharesService.shareDocument(actorUserId, {
         documentId,
         userId: targetUserId,
         permission: "edit",
       } as any)
   
       expect(requireDocumentPermission).toHaveBeenCalledWith({
         userId: actorUserId,
         documentId,
         permission: "delete",
       })
   
       expect(SharesRepo.createShare).toHaveBeenCalledWith({
         documentId,
         sharedWithUserId: targetUserId,
         permission: "edit",
       })
   
       expect(res.success).toBe(true)
     })
   })

// revoke share
describe("SharesService.revokeShare", () => {
     it("throws NotFound when share does not exist", async () => {
       SharesRepo.findShareById.mockResolvedValue(null)
   
       await expect(
         SharesService.revokeShare(actorUserId, shareId)
       ).rejects.toMatchObject({
         code: ErrCode.NotFound,
       })
   
       expect(requireDocumentPermission).not.toHaveBeenCalled()
       expect(SharesRepo.deleteShare).not.toHaveBeenCalled()
     })
   
     it("throws when permission denied", async () => {
       SharesRepo.findShareById.mockResolvedValue({
         id: shareId,
         documentId,
       })
   
       ;(requireDocumentPermission as any).mockRejectedValue(
         new APIError(ErrCode.PermissionDenied, "Denied")
       )
   
       await expect(
         SharesService.revokeShare(actorUserId, shareId)
       ).rejects.toBeInstanceOf(APIError)
   
       expect(SharesRepo.deleteShare).not.toHaveBeenCalled()
     })
   
     it("revokes share when permission granted", async () => {
       SharesRepo.findShareById.mockResolvedValue({
         id: shareId,
         documentId,
       })
   
       ;(requireDocumentPermission as any).mockResolvedValue({})
   
       const res = await SharesService.revokeShare(actorUserId, shareId)
   
       expect(requireDocumentPermission).toHaveBeenCalledWith({
         userId: actorUserId,
         documentId,
         permission: "delete",
       })
   
       expect(SharesRepo.deleteShare).toHaveBeenCalledWith(shareId)
       expect(res.success).toBe(true)
     })
   })

// list shares shared with me
describe("SharesService.listSharedWithMe", () => {
     it("returns shares shared with user", async () => {
       SharesRepo.listSharedWithUser.mockResolvedValue([
         { id: "s1" },
         { id: "s2" },
       ])
   
       const res = await SharesService.listSharedWithMe(actorUserId)
   
       expect(res).toHaveLength(2)
       expect(SharesRepo.listSharedWithUser).toHaveBeenCalledWith(actorUserId)
     })
   })
   