import { db } from "../../drizzle/db"
import { documentShares, documents } from "../../drizzle/schema"
import { and, eq } from "drizzle-orm"

export const SharesRepo = {
  createShare(data: {
    documentId: string
    sharedWithUserId: string
    permission: "view" | "edit"
  }) {
    return db.insert(documentShares).values(data)
  },

  findShareById(shareId: string) {
    return db
      .select()
      .from(documentShares)
      .where(eq(documentShares.id, shareId))
      .limit(1)
      .then(r => r[0])
  },

  deleteShare(shareId: string) {
    return db
      .delete(documentShares)
      .where(eq(documentShares.id, shareId))
  },

  listSharedWithUser(userId: string) {
    return db
      .select()
      .from(documentShares)
      .innerJoin(
        documents,
        eq(documentShares.documentId, documents.id)
      )
      .where(eq(documentShares.sharedWithUserId, userId))
  },
}
