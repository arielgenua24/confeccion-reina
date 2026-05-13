import { useState, useEffect, useRef } from 'react'
import { db } from '../db/indexedDB'

const TTL_7_DAYS = 7 * 24 * 60 * 60 * 1000
const MAX_ENTRIES = 100
const inFlight = new Map()

async function evictIfNeeded() {
  const count = await db.inboxImageCache.count()
  if (count >= MAX_ENTRIES) {
    const oldest = await db.inboxImageCache.orderBy('cachedAt').first()
    if (oldest) await db.inboxImageCache.delete(oldest.url)
  }
}

function fetchAndCache(url) {
  if (inFlight.has(url)) return inFlight.get(url)

  const promise = fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.blob()
    })
    .then(async (blob) => {
      try {
        await evictIfNeeded()
        await db.inboxImageCache.put({ url, blob, cachedAt: Date.now() })
      } catch { /* quota exceeded — skip caching */ }
      return blob
    })
    .finally(() => inFlight.delete(url))

  inFlight.set(url, promise)
  return promise
}

export default function useInboxCachedImage(url) {
  const [src, setSrc] = useState(url || null)
  const objectUrlRef = useRef(null)

  useEffect(() => {
    if (!url) {
      setSrc(null)
      return
    }

    let aborted = false

    const revokePrev = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
    }

    ;(async () => {
      try {
        const cached = await db.inboxImageCache.get(url)
        if (cached && (Date.now() - cached.cachedAt) < TTL_7_DAYS) {
          if (aborted) return
          revokePrev()
          const objUrl = URL.createObjectURL(cached.blob)
          objectUrlRef.current = objUrl
          setSrc(objUrl)
          return
        }

        const blob = await fetchAndCache(url)
        if (aborted) return
        revokePrev()
        const objUrl = URL.createObjectURL(blob)
        objectUrlRef.current = objUrl
        setSrc(objUrl)
      } catch {
        if (!aborted) setSrc(url)
      }
    })()

    return () => {
      aborted = true
      revokePrev()
    }
  }, [url])

  return src
}
