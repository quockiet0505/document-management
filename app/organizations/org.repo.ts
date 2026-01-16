//  access database
import  { db } from "../../drizzle/db"
import { users, organizations, organizationMembers} from "../../drizzle/schema"
import { eq, and} from "drizzle-orm"

// org data access
export const OrgRepo = {
     // create organization
     async createOrg(
          nameOrg: string
     ) {
         return db.insert(organizations).
               values({nameOrg}).
               returning().
               then(r => r[0])
     },

     // add member to org for admin
     async addMemberToOrg(data:{
          userId: string,
          organizationId: string,
          role: "admin" | "member"
     }) {
         return db.insert(organizationMembers).
               values(data).
               returning().
               then(r => r[0])
     },

     // list orgs of user
     async listOrgsOfUser(userId: string){
          return db.select().
               from(organizationMembers).
               where(eq(organizationMembers.userId, userId))
     },
}