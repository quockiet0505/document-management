import { APIError, ErrCode } from "encore.dev/api"
import { OrgRepo } from "./org.repo"
import { AuthRepo} from "../auth/auth.repo"

export const OrgService = {
     // create organization
     async createOrg( params: {
          userId: string,
          nameOrg: string
     }){
          const org = await OrgRepo.createOrg(
               params.nameOrg
          )

          // add creator as admin member
          await OrgRepo.addMemberToOrg({
               userId: params.userId,
               organizationId: org.id,
               role: "admin"
          })

          return org
     },


     // add member to org , checked
     async addMemberOrg( params:{
          userId: string,
          organizationId: string,
          role: "member" | "admin"
     }){
          // check if user is already member
          const existing = await AuthRepo.getMembershipByOrg(params.userId, params.organizationId)
          if(existing){
               throw new APIError(ErrCode.AlreadyExists, "User is already a member of the organization")
          }

          // check if user existing
          const user = await AuthRepo.findUserById(params.userId)
          if(!user){
               throw new APIError(ErrCode.NotFound, "User not found!")
          }

          return OrgRepo.addMemberToOrg({
               userId: params.userId,
               organizationId: params.organizationId,
               role: params.role
          })
     },

     // list orgs of user
     async listOrgsOfUser(userId: string){
          return OrgRepo.listOrgsOfUser(userId)
     }
}