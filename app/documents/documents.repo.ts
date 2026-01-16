// connect db
import { db } from "../../drizzle/db"
import {
  documents,
  documentShares,
  organizationMembers,
} from "../../drizzle/schema"
import { and, eq, or } from "drizzle-orm"

export const DocumentsRepo = {
  // list documents user can access
  async listDocuments(params: {
    userId: string
    organizationId: string
    folderId?: string
    limit: number
    offset: number
  }) {
    const { userId, organizationId, folderId, limit, offset } = params

    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.organizationId, organizationId),
          folderId ? eq(documents.folderId, folderId) : undefined
        )
      )
      .limit(limit)
      .offset(offset)
  },

//   get document by id
  async getDocumentById(id: string) {
    return db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1)
      .then(r => r[0])
  },

// check if user is member of org
  async isOrgMember(userId: string, organizationId: string) {
    return db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, organizationId)
        )
      )
      .limit(1)
      .then(r => r[0])
  },

//  get share permission
  async getSharePermission(userId: string, documentId: string) {
    return db
      .select()
      .from(documentShares)
      .where(
        and(
          eq(documentShares.sharedWithUserId, userId),
          eq(documentShares.documentId, documentId)
        )
      )
      .limit(1)
      .then(r => r[0])
  },
}
