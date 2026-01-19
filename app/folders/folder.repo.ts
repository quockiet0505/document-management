//  database only
import { db } from "../../drizzle/db"
import {folders, organizationMembers } from "../../drizzle/schema"
import { and, eq, } from "drizzle-orm"

export const FolderRepo ={
     // check org member
     isOrgMember(userId: string, organizationId: string){
          return db. 
               select().from(organizationMembers). 
               where( 
                    and(
                         eq(organizationMembers.userId, userId),
                         eq(organizationMembers.organizationId, organizationId)
                    ),

               ).limit(1). 
               then(r => r[0])
     },

     // list folders
     listFolders(organizationId: string){
          return db. 
               select().from(folders). 
               where(
                    eq(folders.organizationId, organizationId)
               )
     },

     // get folder by id
     getFolderById(folderId: string){
          return db. 
               select().from(folders).
               where(
                    eq(folders.id, folderId)
               ).limit(1). 
               then(r => r[0])
     },

     // create folder
     createFolder(name: string, organizationId: string){
          return db.insert(folders). 
               values({
                    name,
                    organizationId
               }). 
               returning().
               then(r => r[0])
     },

     // updata folder
     updateFolder(name: string, folderId: string){
          return db.update(folders). 
               set({
                    name
               }).where(
                    eq(folders.id, folderId)
               )
     }
}