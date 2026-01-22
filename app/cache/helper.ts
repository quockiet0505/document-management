// cache helper
import { cache } from "../cache/keyv"

export async function invalidateDocumentCache(documentId: string) {
  await Promise.all([
    cache.delete(`doc:${documentId}`),
    cache.delete(`doc:summary:${documentId}`),
  ])
}
