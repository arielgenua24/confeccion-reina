import { db } from '../db/indexedDB'

const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000

export async function pruneExpiredInboxImages(ttlMs = TTL_7_DAYS) {
  try {
    const cutoff = Date.now() - ttlMs
    const deleted = await db.inboxImageCache.where('cachedAt').below(cutoff).delete()
    if (deleted > 0) console.log(`🧹 Pruned ${deleted} expired inbox images`)
  } catch {
    // non-critical — don't block app startup
  }
}

export async function clearImageCache() {
  await db.inboxImageCache.clear()
  await db.searchImageCache.clear()
}
