import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useFirestoreContext from '../../hooks/useFirestoreContext'
import {
  getTodayStart,
  getTomorrowStart,
  getMonthStart,
  getMonthEnd,
  getMonthWeeks,
  getMonthNameEs,
  formatDateEs,
} from '../../utils/dateUtils'
import './styles.css'

// Sum item counts from order documents
function computeItemCount(orders) {
  return orders.reduce((total, order) => {
    if (Array.isArray(order.products) && order.products.length > 0) {
      return total + order.products.reduce((s, p) => s + (p.quantity || p.stock || 0), 0)
    }
    return total + (order.itemCount || 0)
  }, 0)
}

function getCacheKey(period) {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  if (period === 'today') return null // never cache today
  if (period === 'month') return `rc_sold_month_${y}_${m}`
  if (period.startsWith('week-')) return `rc_sold_week_${y}_${m}_${period.replace('week-', '')}`
  return null
}

function getCached(key) {
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { count, isPast } = JSON.parse(raw)
    if (isPast) return count // only past periods are cached (their counts never change)
    return null // current periods always fetch fresh data
  } catch {
    return null
  }
}

function setCache(key, count, isPast) {
  if (!key) return
  if (!isPast) return // only cache periods fully in the past (their counts never change)
  try {
    localStorage.setItem(key, JSON.stringify({ count, isPast: true }))
  } catch {
    // ignore quota errors
  }
}

function getDateRange(period, weeks) {
  const today = new Date()
  if (period === 'today') {
    return { start: getTodayStart(), end: getTomorrowStart() }
  }
  if (period === 'month') {
    return { start: getMonthStart(today), end: getMonthEnd(today) }
  }
  if (period.startsWith('week-')) {
    const num = parseInt(period.replace('week-', ''), 10)
    const week = weeks.find(w => w.weekNum === num)
    if (week) return { start: week.start, end: week.end }
  }
  return null
}

const LOGO_URL = 'https://ik.imagekit.io/arielgenua/ChatGPT%20Image%206%20abr%202026,%2005_54_51%20p.m..png?updatedAt=1775508927579'

function buildMessage(period, count, weeks) {
  const today = new Date()
  const monthName = getMonthNameEs(today)
  const dateStr = formatDateEs(today)

  if (period === 'today') {
    return (
      <>
        Reina, hoy {dateStr} has vendido{' '}
        <span className="sp-chat-count">{count}</span> prendas
      </>
    )
  }

  if (period === 'month') {
    return (
      <>
        Reina, este mes de {monthName} has vendido{' '}
        <span className="sp-chat-count">{count}</span> prendas en total
      </>
    )
  }

  if (period.startsWith('week-')) {
    const num = parseInt(period.replace('week-', ''), 10)
    const week = weeks.find(w => w.weekNum === num)
    const ordinals = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta']
    const ordinal = ordinals[num - 1] || `${num}ta`

    if (week?.isCurrent) {
      return (
        <>
          Reina, esta semana de {monthName} has vendido{' '}
          <span className="sp-chat-count">{count}</span> prendas
        </>
      )
    }
    return (
      <>
        Reina, la {ordinal} semana de {monthName} has vendido{' '}
        <span className="sp-chat-count">{count}</span> prendas
      </>
    )
  }

  return <>Reina, has vendido <span className="sp-chat-count">{count}</span> prendas</>
}

function SoldProductsDetail() {
  const { period } = useParams()
  const navigate = useNavigate()
  const { getOrdersByDateRangeBounded } = useFirestoreContext()

  const today = new Date()
  const weeks = getMonthWeeks(today)

  const [count, setCount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cacheKey = getCacheKey(period)
    const cached = getCached(cacheKey)
    if (cached !== null) {
      setCount(cached)
      setIsLoading(false)
      return
    }

    const range = getDateRange(period, weeks)
    if (!range) {
      setCount(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    getOrdersByDateRangeBounded(range.start, range.end)
      .then(orders => {
        const total = computeItemCount(orders)
        setCount(total)

        // Determine if this period is fully in the past
        const isPast = range.end < getTodayStart()
        setCache(cacheKey, total, isPast)
      })
      .catch(err => {
        console.error('Error fetching sold products:', err)
        setCount(0)
      })
      .finally(() => setIsLoading(false))
  }, [period]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="sp-page">
      <button className="sp-back-pill" onClick={() => navigate('/inbox')}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginRight: '2px'}}>
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver
      </button>

      <div className="sp-chat">
        <div className="sp-chat-avatar">
          <img src={LOGO_URL} alt="Reina Chura" />
        </div>
        <div className="sp-chat-bubble">
          {isLoading ? (
            <p className="sp-chat-loading">
              <span className="sp-chat-dot" />
              <span className="sp-chat-dot" />
              <span className="sp-chat-dot" />
            </p>
          ) : (
            <p className="sp-chat-message">
              {buildMessage(period, count, weeks)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default SoldProductsDetail
