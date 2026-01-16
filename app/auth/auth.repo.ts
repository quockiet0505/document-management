//  data access
import  { db } from "../../drizzle/db"
import { users, organizations, organizationMembers} from "../../drizzle/schema"
import { eq, and} from "drizzle-orm"

// database access
export const AuthRepo = {

     // find user by emmail
     async findUserByEmail(email: string){
         return db.select().
               from(users).
               where(eq(users.email, email)).
               limit(1).
               then( r => r[0])
          
     },

     // find user by id
     async findUserById(userId: string){
          return db.select().
               from(users).
               where(eq(users.id, userId)).
               limit(1).
               then( r => r[0])
     },

     // create user
     async createUser(data: {
          email: string,
          passwordHash: string ,
          fullName: string,
          phone?: string
     }) {
         return db.insert(users).
               values(data).
               returning().
               then(r => r[0])
          
         
     },

     // get org of user
     async getUserOrg(userId: string){
          return db.select().
               from(organizationMembers).
               where(eq(organizationMembers.userId, userId))
     },

     // check member in org
     async getMembershipByOrg(userId: string, organizationId: string){
          return db.select().
               from(organizationMembers). 
               where(
                    and(
                         eq(organizationMembers.userId, userId),
                         eq(organizationMembers.organizationId, organizationId)
                    )
               ).limit(1). 
               then( r => r[0])
     }


}
