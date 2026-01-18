// repo for accessing documents in hte db
import { db } from "../../drizzle/db"
import {
  documents,
  documentShares,
  organizationMembers,
  documentMetadata,
} from "../../drizzle/schema"
import { and, eq, ilike, isNull } from "drizzle-orm"

import {
  ListDocumentsParams,
  CreateDocumentData,
} from "./documents.types"


export const DocumentsRepo = {
  // check if user is member
  isOrgMember(userId: string, organizationId: string) {
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

  // get document by id
  getDocumentById(documentId: string) {
    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          isNull(documents.deletedAt)
        )
      )
      .limit(1)
      .then(r => r[0])
  },

  // list document with pagination
  listDocuments(params: ListDocumentsParams) {
    const conditions = [
      eq(documents.organizationId, params.organizationId),
      isNull(documents.deletedAt),
    ]

    if (params.folderId) {
      conditions.push(eq(documents.folderId, params.folderId))
    }

    return db
      .select()
      .from(documents)
      .where(and(...conditions))
      .limit(params.limit)
      .offset(params.offset)
  },

  // create new document
  createDocument(data: CreateDocumentData) {
    return db.insert(documents).values(data).returning().then(r => r[0])
  },

  // update document
  updateDocument(documentId: string, data: Partial<CreateDocumentData>) {
    return db
      .update(documents)
      .set(data)
      .where(eq(documents.id, documentId))
  },


  // delete soft delete
  softDeleteDocument(documentId: string, userId: string) {
    return db
      .update(documents)
      .set({
        deletedAt: new Date(),
        deletedBy: userId,
      })
      .where(eq(documents.id, documentId))
  },

  // share document
  shareDocument(data: any) {
    return db.insert(documentShares).values(data)
  },

  // get share permission for user
  getSharePermission(userId: string, documentId: string) {
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


  // search document by keyword
  searchDocuments(params: {
    organizationId: string
    keyword: string
    limit: number
    offset: number
  }) {
    return db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.organizationId, params.organizationId),
          ilike(documents.name, `%${params.keyword}%`),
          isNull(documents.deletedAt)
        )
      )
      .limit(params.limit)
      .offset(params.offset)
  },

  // read summary 
  getDocumentSummary(documentId: string) {
    return db
      .select()
      .from(documentMetadata)
      .where(eq(documentMetadata.documentId, documentId))
      .limit(1)
      .then(r => r[0])
  },

  // save metadata
    saveDocumentMetadata(data: {
      documentId: string
      extractedText?: string
      summary?: string
    }) {
      return db.insert(documentMetadata).values(data)
    },
}
