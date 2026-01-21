import { describe, it, expect, beforeEach } from "vitest"
import { requireDocumentPermission } from "../../app/shared/document-permissions"
import { DocumentsRepo } from "../mocks/documents.repo"
import { AuthRepo } from "../mocks/auth.repo"
import { APIError, ErrCode } from "encore.dev/api"

const userId = "user-1"
const docId = "doc-1"
const orgId = "org-1"

// reset mocks before each test
beforeEach(() => {
     Object.values(DocumentsRepo).forEach(fn => fn.mockReset())
     Object.values(AuthRepo).forEach(fn => fn.mockReset())
})

// requireDocumentPermission
// userId = document.ownerId => allow
describe("requireDocumentPermission - owner", () =>{
     it("allows owner to have any permission", async() =>{

          const ownerId = "owner-1"
          // mock document owned 
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: docId,
               ownerId: ownerId,
               organizationId: orgId,
          })

          // share permission
          DocumentsRepo.getSharePermission.mockResolvedValue(null)

          // call requireDocumentPermission
          const res = await requireDocumentPermission({
               userId: ownerId,
               documentId: docId,
               permission: "edit",
          })
          expect(res.id).toBe(docId)
     })
})

// AuthRepo.getMembershipByOrg -> role = admin
describe("requireDocumentPermission - org admin", () =>{
     it("allows org admin to have any permission", async() =>{
          const adminId = "admin-1"
          // mock document 
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: docId,
               ownerId: "owner-1",
               organizationId: orgId,
          })

          // mock membership as admin
          AuthRepo.getMembershipByOrg.mockResolvedValue({
               userId: adminId,
               organizationId: orgId,
               role: "admin",
          })

          // share permission
          DocumentsRepo.getSharePermission.mockResolvedValue(null)

          // call requireDocumentPermission
          const res = await requireDocumentPermission({
               userId: adminId,
               documentId: docId,
               permission: "delete",
          })
          expect(res.id).toBe(docId)
     })
})


// SharesRepo.getSharePermission -> { permission: "edit" }
describe("requireDocumentPermission - shared user permission edit", () =>{
     it("allows shared user with sufficient permission", async() =>{
          const sharedUserId = "user-2"
          // mock document
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: docId,
               ownerId: "owner-1",
               organizationId: orgId,
          })

          // mock membership as a member
          AuthRepo.getMembershipByOrg.mockResolvedValue({
               userId: sharedUserId,
               organizationId: orgId,
               role: "member",
          })

          // mock share permission as edit
          DocumentsRepo.getSharePermission.mockResolvedValue({
               documentId: docId,
               sharedWithUserId: sharedUserId,
               permission: "edit",
          })

          // call requireDocumentPermission for edit
          const res = await requireDocumentPermission({
               userId: sharedUserId,
               documentId: docId,
               permission: "edit"
          })

          // expect success
          expect(res.id).toBe(docId)
     })
})

// role = member
// permission = view
// required = edit
// -> PermissionDenied
describe("requireDocumentPermission - shared user", () =>{
     it("allows shared user with sufficient permission", async() =>{
          const sharedUserId = "user-2"
          // mock document
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: docId,
               ownerId: "owner-1",
               organizationId: orgId,
          })

          // mock membership as a member
          AuthRepo.getMembershipByOrg.mockResolvedValue({
               userId: sharedUserId,
               organizationId: orgId,
               role: "member",
          })

          // mock share permission as edit
          DocumentsRepo.getSharePermission.mockResolvedValue({
               documentId: docId,
               sharedWithUserId: sharedUserId,
               permission: "view",
          })

          // call requireDocumentPermission for edit
          await expect(
               requireDocumentPermission({
                    userId: sharedUserId,
                    documentId: docId,
                    permission: "edit"
               })
           ).rejects.toBeInstanceOf(APIError)
         
     })
})

// SharesRepo.getSharePermission -> null ( no owner, no admin, no share)
describe("requireDocumentPermission - shared user", () =>{
     it("allows shared user with sufficient permission", async() =>{
          const sharedUserId = "user-2"
          // mock document
          DocumentsRepo.getDocumentById.mockResolvedValue({
               id: docId,
               ownerId: "owner-1",
               organizationId: orgId,
          })

          // mock membership as a member
          AuthRepo.getMembershipByOrg.mockResolvedValue({
               userId: sharedUserId,
               organizationId: orgId,
               role: "member",
          })

          // mock share permission as edit
          DocumentsRepo.getSharePermission.mockResolvedValue(null)

          // call requireDocumentPermission for edit
           await expect(
               requireDocumentPermission({
                    userId: sharedUserId,
                    documentId: docId,
                    permission: "edit"
               })
           ).rejects.toBeInstanceOf(APIError)
         
     })
})

// DocumentsRepo.getDocumentById -> null
describe("requireDocumentPermission - document not found", ()=>{
     it("throws notfound error when document does not exit", async () =>{
          DocumentsRepo.getDocumentById.mockResolvedValue(null)

          // call requireDocumentPermission
          await expect(
               requireDocumentPermission({
                    userId: userId,
                    documentId: docId,
                    permission: "view",
               })
          ).rejects.toBeInstanceOf(APIError)
     })
})
