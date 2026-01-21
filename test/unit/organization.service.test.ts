import { vi, describe, it, expect, beforeEach } from "vitest"
import { APIError, ErrCode } from "encore.dev/api"

// mock OrgRepo
vi.mock("../../app/organizations/org.repo", async () => {
  const mod = await import("../mocks/org.repo")
  return mod
})

// mock AuthRepo
vi.mock("../../app/auth/auth.repo", async () => {
  const mod = await import("../mocks/auth.repo")
  return mod
})

import { OrgService } from "../../app/organizations/org.service"
import { OrgRepo } from "../mocks/org.repo"
import { AuthRepo } from "../mocks/auth.repo"

// common test data
const userId = "user-1"
const orgId = "org-1"
const orgName = "My Org"

beforeEach(() => {
  Object.values(OrgRepo).forEach(fn => fn.mockReset())
  Object.values(AuthRepo).forEach(fn => fn.mockReset())
})

// create Org
describe("OrgService.createOrg", () => {
     it("creates org and adds creator as admin", async () => {
       OrgRepo.createOrg.mockResolvedValue({
         id: orgId,
         name: orgName,
       })
   
       const res = await OrgService.createOrg({
         userId,
         nameOrg: orgName,
       })
   
       expect(OrgRepo.createOrg).toHaveBeenCalledWith(orgName)
   
       expect(OrgRepo.addMemberToOrg).toHaveBeenCalledWith({
         userId,
         organizationId: orgId,
         role: "admin",
       })
   
       expect(res.id).toBe(orgId)
     })
   })

// add member to org
describe("OrgService.addMemberOrg", () => {
     it("throws AlreadyExists if user is already member", async () => {
       AuthRepo.getMembershipByOrg.mockResolvedValue({
         userId,
         organizationId: orgId,
       })
   
       await expect(
         OrgService.addMemberOrg({
           userId,
           organizationId: orgId,
           role: "member",
         })
       ).rejects.toMatchObject({
         code: ErrCode.AlreadyExists,
       })
   
       expect(OrgRepo.addMemberToOrg).not.toHaveBeenCalled()
     })

     // user not found
     it("throws NotFound if user does not exist", async () => {
          AuthRepo.getMembershipByOrg.mockResolvedValue(null)
          AuthRepo.findUserById.mockResolvedValue(null)
      
          await expect(
            OrgService.addMemberOrg({
              userId,
              organizationId: orgId,
              role: "member",
            })
          ).rejects.toMatchObject({
            code: ErrCode.NotFound,
          })
      
          expect(OrgRepo.addMemberToOrg).not.toHaveBeenCalled()
        })

     //  add member success
     it("adds member to org when valid", async () => {
          AuthRepo.getMembershipByOrg.mockResolvedValue(null)
          AuthRepo.findUserById.mockResolvedValue({
            id: userId,
            email: "test@example.com",
          })
      
          OrgRepo.addMemberToOrg.mockResolvedValue({
            userId,
            organizationId: orgId,
            role: "member",
          })
      
          const res = await OrgService.addMemberOrg({
            userId,
            organizationId: orgId,
            role: "member",
          })
      
          expect(OrgRepo.addMemberToOrg).toHaveBeenCalledWith({
            userId,
            organizationId: orgId,
            role: "member",
          })
      
          expect(res.role).toBe("member")
        })
      })

// list orgs of user
describe("OrgService.listOrgsOfUser", () => {
     it("returns organizations of user", async () => {
       OrgRepo.listOrgsOfUser.mockResolvedValue([
         { id: "org-1" },
         { id: "org-2" },
       ])
   
       const res = await OrgService.listOrgsOfUser(userId)
   
       expect(res).toHaveLength(2)
       expect(OrgRepo.listOrgsOfUser).toHaveBeenCalledWith(userId)
     })
   })
   