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
   
   
     //  DOCUMENTS
    
   export const documents = pgTable("documents", {
     id: uuid("id").defaultRandom().primaryKey(),
     name: text("name").notNull(),
     mimeType: text("mime_type").notNull(),
     size: integer("size").notNull(),
     storageKey: text("storage_key").notNull(),
     status: text("status").$type<"processing" | "ready" | "error">(),
   
     organizationId: uuid("organization_id")
          .notNull()
          .references(() => organizations.id),
   
     ownerId: uuid("owner_id")
          .notNull()
          .references(() => users.id),
     
     createdAt: timestamp("created_at").defaultNow(),
     updatedAt: timestamp("updated_at"),
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
   
     permission: text("permission").notNull(), // view | edit
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
   