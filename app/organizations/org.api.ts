// call api org
import {api} from "encore.dev/api"
import { OrgService } from "./org.service"
import { CreateOrgSchema, AddMemberSchema } from "./org.schema"
import { getAuthData } from "~encore/auth"

// create org
export const createOrg = api(
     {method: "POST", path:"/v1/organization/create", auth:true},
     async(body: {nameOrg: string}) =>{
          const input = CreateOrgSchema.parse(body)
          const auth = getAuthData()

          return OrgService.createOrg({
               userId: auth.userID,
               nameOrg: input.nameOrg
          })
     }
)

// add member to org
export const addMemberToOrg = api(
     {method: "POST", path:"/v1/organization/members/add", auth:true},
     async(body: {organizationId: string, userId: string, role: "admin" | "member"}) =>{
          const input = AddMemberSchema.parse(body)
          const auth = getAuthData()

          // only admin can add member
          await OrgService.addMemberOrg({
               userId: input.userId,
               organizationId: input.organizationId,
               role: input.role
          })

          return { success: true }
     }
)

// list orgs of user
export const listOrgsOfUser = api(
     {method: "GET", path:"/v1/organization/my-orgs", auth:true},
     async() =>{
          const auth = getAuthData()

          return OrgService.listOrgsOfUser(
               auth.userID
          )
     }
)