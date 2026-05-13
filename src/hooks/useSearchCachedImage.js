import { useState, useEffect, useRef } from 'react'
import { db } from '../db/indexedDB'

const MAX_ENTRIES = 30
const inFlight = new Map()

async function evictAndStore(url, blob) {
  const count = await db.searchImageCache.count()
  if (count >= MAX_ENTRIES) {
    const oldest = await db.searchImageCache.orderBy('lastAccessed').first()
    if (oldest) await db.searchImageCache.delete(oldest.url)
  }
  await db.searchImageCache.put({ url, blob, lastAccessed: Date.now() })
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
        await evictAndStore(url, blob)
      } catch { /* quota exceeded — skip caching */ }
      return blob
    })
    .finally(() => inFlight.delete(url))

  inFlight.set(url, promise)
  return promise
}

export default function useSearchCachedImage(url) {
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
        const cached = await db.searchImageCache.get(url)
        if (cached) {
          // Update lastAccessed asynchronously (don't await — fire and forget)
          db.searchImageCache.update(url, { lastAccessed: Date.now() }).catch(() => {})

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
