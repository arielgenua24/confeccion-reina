import { useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../../firebaseSetUp'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import useFirestoreContext from '../useFirestoreContext'

const IDB_DB_NAME = 'reina-insights-v3'
const IDB_STORE = 'insights'
const IDB_KEY = 'latest'
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const POLL_INTERVAL_MS = 30_000
const API_URL = '/api/generate-insights'

// ── TTL helper ──────────────────────────────────────────────────────────────

function isExpired(generatedAt) {
  if (!generatedAt) return true
  return Date.now() - new Date(generatedAt).getTime() > TTL_MS
}

// ── IndexedDB helpers ───────────────────────────────────────────────────────

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 2)
    req.onupgradeneeded = (e) => {
      const idb = e.target.result
      if (idb.objectStoreNames.contains(IDB_STORE)) {
        idb.deleteObjectStore(IDB_STORE)
      }
      idb.createObjectStore(IDB_STORE, { keyPath: 'key' })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet() {
  try {
    const idb = await openIDB()
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function idbSet(insights, generatedAt) {
  try {
    const idb = await openIDB()
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite')
      tx.objectStore(IDB_STORE).put({ key: IDB_KEY, insights, generatedAt })
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Non-fatal
  }
}

// ── Data compilation ────────────────────────────────────────────────────────

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function compileWeeklySummary(orders, start, end) {
  const revenueByDay = {}
  const productMap = {}

  for (const order of orders) {
    const date = order.createdAt?.toDate?.() || new Date(order.createdAt)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const dayName = DAY_NAMES[date.getDay()]

    if (!revenueByDay[dateKey]) {
      revenueByDay[dateKey] = { date: dateKey, dayName, orders: 0, revenue: 0 }
    }
    revenueByDay[dateKey].orders++
    revenueByDay[dateKey].revenue += order.total || 0

    for (const item of order.products || []) {
      const name = item.productData?.name || 'Desconocido'
      const price = parseFloat(item.productData?.price) || 0
      const qty = item.stock || 0
      if (!productMap[name]) productMap[name] = { name, unitsSold: 0, revenue: 0 }
      productMap[name].unitsSold += qty
      productMap[name].revenue += qty * price
    }
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  const daysList = Object.values(revenueByDay).sort((a, b) => a.date.localeCompare(b.date))
  const bestDay = daysList.length
    ? daysList.reduce((mx, d) => (d.revenue > mx.revenue ? d : mx), daysList[0])
    : null
  const slowestDay = daysList.length
    ? daysList.reduce((mn, d) => (d.revenue < mn.revenue ? d : mn), daysList[0])
    : null

  const fmt = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  return {
    period: `${fmt(start)} – ${fmt(end)}`,
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
    topProducts,
    revenueByDay: daysList,
    bestDay: bestDay?.dayName || 'N/A',
    slowestDay: slowestDay?.dayName || 'N/A',
  }
}

// ── Main hook ───────────────────────────────────────────────────────────────

export default function useReinaInsights() {
  const { getOrdersByDateRangeBounded, getProductsByOrder } = useFirestoreContext()

  const [insights, setInsights] = useState(null)
  const [generatedAt, setGeneratedAt] = useState(null)
  // status: 'checking' | 'generating' | 'polling' | 'completed' | 'error'
  const [status, setStatus] = useState('checking')

  const pollTimer = useRef(null)
  const didRun = useRef(false)

  const isValidInsightsText = (str) => typeof str === 'string' && str.trim().length > 0

  const clearPoll = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }

  // ── Firestore helpers ──────────────────────────────────────────────────

  const readFirestoreInsights = useCallback(async () => {
    const ref = doc(db, 'metadata', 'ai_insights')
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  }, [])

  const writeFirestoreStatus = useCallback(async (payload) => {
    const ref = doc(db, 'metadata', 'ai_insights')
    await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true })
  }, [])

  // ── Generation ─────────────────────────────────────────────────────────

  const generateInsights = useCallback(async () => {
    setStatus('generating')
    try {
      await writeFirestoreStatus({ status: 'generating', startedAt: serverTimestamp() })

      // Last 7 days from now
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const start = new Date(end)
      start.setDate(end.getDate() - 6)
      start.setHours(0, 0, 0, 0)

      const ordersList = await getOrdersByDateRangeBounded(start, end)
      const ordersWithDetails = await Promise.all(
        ordersList.map(async (order) => {
          const products = await getProductsByOrder(order.id)
          const total = products.reduce((acc, item) => {
            const price = parseFloat(item.productData?.price) || 0
            return acc + item.stock * price
          }, 0)
          return { ...order, total, products }
        })
      )

      const summary = compileWeeklySummary(ordersWithDetails, start, end)

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        console.error('[useReinaInsights] API error', response.status, errBody)
        throw new Error(`API error ${response.status}: ${errBody.error || 'unknown'}`)
      }

      const { insights: aiInsights } = await response.json()
      const now = new Date().toISOString()

      await writeFirestoreStatus({
        status: 'completed',
        insights: aiInsights,
        generatedAt: serverTimestamp(),
      })

      await idbSet(aiInsights, now)

      setInsights(aiInsights)
      setGeneratedAt(now)
      setStatus('completed')
    } catch (err) {
      console.error('[useReinaInsights] generation failed:', err)
      await writeFirestoreStatus({ status: 'error' }).catch(() => {})
      setStatus('error')
    }
  }, [getOrdersByDateRangeBounded, getProductsByOrder, writeFirestoreStatus])

  // ── Polling (another device is already generating) ─────────────────────

  const startPolling = useCallback(() => {
    setStatus('polling')
    clearPoll()

    const check = async () => {
      try {
        const data = await readFirestoreInsights()
        if (
          data?.status === 'completed' &&
          data?.insights &&
          !isExpired(data.generatedAt?.toDate?.()?.toISOString()) &&
          isValidInsightsText(data.insights)
        ) {
          clearPoll()
          const ts = data.generatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
          await idbSet(data.insights, ts)
          setInsights(data.insights)
          setGeneratedAt(ts)
          setStatus('completed')
        }
      } catch {
        // keep polling on transient error
      }
    }

    pollTimer.current = setInterval(check, POLL_INTERVAL_MS)
  }, [readFirestoreInsights])

  // ── Bootstrap ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const bootstrap = async () => {
      // 1. IndexedDB — device-local cache, no Firestore read needed
      const cached = await idbGet()
      if (cached?.insights && !isExpired(cached.generatedAt) && isValidInsightsText(cached.insights)) {
        setInsights(cached.insights)
        setGeneratedAt(cached.generatedAt)
        setStatus('completed')
        return
      }

      // 2. Firestore — one read per session when cache is empty/expired
      let fsData = null
      try {
        fsData = await readFirestoreInsights()
      } catch (err) {
        console.warn('[useReinaInsights] Firestore read failed:', err)
      }

      if (fsData) {
        const fsGeneratedAt = fsData.generatedAt?.toDate?.()?.toISOString()

        if (fsData.status === 'completed' && fsData.insights && !isExpired(fsGeneratedAt) && isValidInsightsText(fsData.insights)) {
          await idbSet(fsData.insights, fsGeneratedAt)
          setInsights(fsData.insights)
          setGeneratedAt(fsGeneratedAt)
          setStatus('completed')
          return
        }

        if (fsData.status === 'generating') {
          startPolling()
          return
        }
      }

      // 3. No fresh insights anywhere (or old text format) → generate now
      await generateInsights()
    }

    bootstrap()

    return () => clearPoll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { insights, status, generatedAt }
}
