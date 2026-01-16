import {
     pgTable,
     uuid,
     text,
     timestamp,
     integer,
     jsonb,
   } from "drizzle-orm/pg-core"
   
   
     // USERS
 
   export const users = pgTable("users", {
     id: uuid("id").defaultRandom().primaryKey(),
     email: text("email").notNull().unique(),
     fullName: text("full_name").notNull(),
     phone: text("phone"),
     passwordHash: text("password_hash").notNull(),
     createdAt: timestamp("created_at").defaultNow(),

   })
   

     //  ORGANIZATIONS

   export const organizations = pgTable("organizations", {
     id: uuid("id").defaultRandom().primaryKey(),
     nameOrg: text("name_org").notNull(),
     createdAt: timestamp("created_at").defaultNow(),
   })
   
   
     //  ORGANIZATION MEMBERS
 
   export const organizationMembers = pgTable("organization_members", {
     id: uuid("id").defaultRandom().primaryKey(),
     userId: uuid("user_id")
          .notNull()
          .references(() => users.id),
     organizationId: uuid("organization_id")
          .notNull()
          .references(() => organizations.id),
     role: text("role")
          .$type<"admin" | "member">()
          .notNull()

   })
   
   //  FOLDER
  export const folders = pgTable("folders", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    name: text("name").notNull(),
  
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
  
    createdAt: timestamp("created_at").defaultNow(),
  })
  
   
     //  DOCUMENTS
     export const documents = pgTable("documents", {
      id: uuid("id").defaultRandom().primaryKey(),
    
      name: text("name").notNull(),
      mimeType: text("mime_type").notNull(),
    
      // latest file info
      size: integer("size").notNull(),
      storageKey: text("storage_key").notNull(),
    
      status: text("status")
        .$type<"processing" | "ready" | "error">()
        .default("processing"),
    
      latestVersion: integer("latest_version").default(1),
    
      folderId: uuid("folder_id")
        .references(() => folders.id),
    
      organizationId: uuid("organization_id")
        .notNull()
        .references(() => organizations.id),
    
      ownerId: uuid("owner_id")
        .notNull()
        .references(() => users.id),
    
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at"),
      // use for soft delete
      deletedAt: timestamp("deleted_at"),
      deletedBy: uuid("deleted_by").references(() => users.id),

    })
    
  // DOCUMENT VERSIONS
  export const documentVersions = pgTable("document_versions", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id),
  
    version: integer("version").notNull(),
  
    storageKey: text("storage_key").notNull(),
    size: integer("size").notNull(),
    mimeType: text("mime_type").notNull(),
  
    createdAt: timestamp("created_at").defaultNow(),
  })
  

     //  DOCUMENT SHARES
     //  can access document, not member of org
   
   export const documentShares = pgTable("document_shares", {
     id: uuid("id").defaultRandom().primaryKey(),
     documentId: uuid("document_id")
          .notNull()
          .references(() => documents.id),
   
     sharedWithUserId: uuid("shared_with_user_id")
          .notNull()
          .references(() => users.id),
   
     permission: text("permission")
          .$type<"view" | "edit">()
          .notNull()
        , // view | edit
     createdAt: timestamp("created_at").defaultNow(),
   })
   
   
     //  DOCUMENT METADATA

   export const documentMetadata = pgTable("document_metadata", {
     id: uuid("id").defaultRandom().primaryKey(),
     documentId: uuid("document_id")
          .notNull()
          .references(() => documents.id),
     
     extractedText: text("extracted_text"),
     summary: text("summary"),
     extraJson: jsonb("extra_json"),
   })
   