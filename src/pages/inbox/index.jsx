import useFirestoreContext from '../../hooks/useFirestoreContext'
import useIsAdmin from '../../hooks/useIsAdmin'
import LoadingComponent from '../../components/Loading'
import ImageModal from '../../components/ImageModal'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getMonthWeeks, getMonthNameEs } from '../../utils/dateUtils'
import kellyAudio from '../../../../audio/kelly.mp3'
import CachedImage from '../../components/CachedImage'
import ReinaInsights from '../../components/ReinaInsights'
import OrderDateCalendar from '../../components/OrderDateCalendar'
import { calculateOrderTotal, getOrderProductsForEarnings } from '../../utils/earnings'
import './styles.css'

const DATE_EARNINGS_TITLE = 'Revisar ingresos por un día específico'

function Inbox() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalImage, setModalImage] = useState(null)
  const [showEarningsCalendar, setShowEarningsCalendar] = useState(false)
  const [typedEarningsTitle, setTypedEarningsTitle] = useState('')
  const { getOrdersByDateRange, getProductsByOrder } = useFirestoreContext()
  const { isAdmin } = useIsAdmin()
  const navigate = useNavigate()

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const now = useMemo(() => new Date(), [])
  const weeks = useMemo(() => getMonthWeeks(now), [now])
  const monthName = useMemo(() => getMonthNameEs(now), [now])
  const currentWeek = useMemo(() => weeks.find(w => w.isCurrent), [weeks])
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')

  const audioRef = useRef(null)
  const hasStartedTitleAnimation = useRef(false)
  const playAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(kellyAudio)
    }
    audioRef.current.currentTime = 0
    audioRef.current.play()
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const ordersList = await getOrdersByDateRange(today)
        const ordersWithDetails = await Promise.all(
          ordersList.map(async (order) => {
            const products = await getOrderProductsForEarnings(order, getProductsByOrder)
            const total = calculateOrderTotal(products)
            return { ...order, total, products }
          })
        )
        setOrders(ordersWithDetails)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
      setIsLoading(false)
    }
    fetchOrders()
  }, [getOrdersByDateRange, getProductsByOrder, today])

  useEffect(() => {
    if (isLoading || hasStartedTitleAnimation.current) return undefined

    hasStartedTitleAnimation.current = true
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setTypedEarningsTitle(DATE_EARNINGS_TITLE)
      return undefined
    }

    let characterIndex = 0
    const typingTimer = window.setInterval(() => {
      characterIndex += 1
      setTypedEarningsTitle(DATE_EARNINGS_TITLE.slice(0, characterIndex))

      if (characterIndex >= DATE_EARNINGS_TITLE.length) {
        window.clearInterval(typingTimer)
      }
    }, 55)

    return () => window.clearInterval(typingTimer)
  }, [isLoading])

  const dailyEarnings = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0)
  }, [orders])

  const topProducts = useMemo(() => {
    const productMap = {}
    orders.forEach(order => {
      order.products?.forEach(item => {
        const productName = item.productData?.name || 'Producto desconocido'
        const imageUrl = item.productData?.imageUrl
        if (!productMap[productName]) {
          productMap[productName] = { count: 0, imageUrl }
        }
        productMap[productName].count += (item.stock || 0)
      })
    })
    return Object.entries(productMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
  }, [orders])

  const formatCurrency = (amount) => `$${amount.toLocaleString('es-ES')}`

  const navigateToEarnings = (period) => navigate(`/inbox/earnings/${period}`)

  const openEarningsForDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    setShowEarningsCalendar(false)
    navigate(`/inbox/earnings/date?date=${year}-${month}-${day}`)
  }

  return (
    <div className="apple-inbox">
      <LoadingComponent isLoading={isLoading} />

      {!isLoading && (
        <div className="apple-inbox-content">

          <header className="apple-header">
            <h1 className="apple-greeting">Hola! lista para<br />revisar tus ingresos?</h1>
          </header>

          <button
            type="button"
            className="apple-date-earnings-card"
            onClick={() => setShowEarningsCalendar(true)}
          >
            <span className="apple-date-earnings-title" aria-label={DATE_EARNINGS_TITLE}>
              <span aria-hidden="true">{typedEarningsTitle}</span>
              {typedEarningsTitle.length < DATE_EARNINGS_TITLE.length && (
                <span className="apple-date-earnings-cursor" aria-hidden="true" />
              )}
            </span>
            <span className="apple-date-earnings-arrow" aria-hidden="true">
              <ArrowRight size={30} strokeWidth={2.5} />
            </span>
          </button>

          {showEarningsCalendar && (
            <OrderDateCalendar
              singleDay
              title="¿Qué día quieres revisar?"
              confirmLabel="Ver ingresos"
              onConfirm={openEarningsForDate}
              onCancel={() => setShowEarningsCalendar(false)}
            />
          )}

          {/* Earnings cards */}
          <div className="apple-cards-scroll">
            <button
              type="button"
              className="apple-card apple-card-button"
              onClick={() => navigateToEarnings('daily')}
            >
              <span className="apple-card-label">Ingresos del día</span>
              <span className="apple-card-date">{today.getDate()}/{today.getMonth() + 1}</span>
              <span className="apple-card-amount">{formatCurrency(dailyEarnings)}</span>
              <span className="apple-card-cta">Ver detalle</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className="apple-card apple-card-button"
                onClick={() => navigateToEarnings('weekly')}
              >
                <span className="apple-card-label">Ingresos de la semana</span>
                <span className="apple-card-cta">Ver detalle</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                className="apple-card apple-card-button"
                onClick={() => navigateToEarnings('monthly')}
              >
                <span className="apple-card-label">Ingresos del mes</span>
                <span className="apple-card-cta">Ver detalle</span>
              </button>
            )}
          </div>

          {/* AI Insights */}
          <ReinaInsights />

          {/* Top Products */}
          <section className="apple-section">
            <div className="apple-section-header">
              <h2 className="apple-section-title">Resumen de Elementos</h2>
              <span className="apple-section-badge">Top 5 hoy</span>
            </div>

            <div className="apple-list">
              {topProducts.length > 0 ? (
                topProducts.map(([name, data]) => {
                  const { count, imageUrl } = data
                  const maxCount = topProducts[0][1].count
                  const percentage = (count / maxCount) * 100
                  return (
                    <div key={name} className="apple-list-item">
                      <div className="apple-item-info">
                        {imageUrl && (
                          <CachedImage
                            cacheStrategy="inbox"
                            src={imageUrl}
                            alt={name}
                            loading="lazy"
                            onClick={() => setModalImage(imageUrl)}
                            style={{ cursor: 'zoom-in', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '8px' }}
                          />
                        )}
                        <span className="apple-item-name">{name}</span>
                        <span className="apple-item-count">{count}</span>
                      </div>
                      <div className="apple-progress-bg">
                        <div className="apple-progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="apple-empty-state">No hay ventas hoy</div>
              )}
            </div>
          </section>

          {/* ── Cuántas prendas has vendido ── */}
          <section className="sp-section">

            <header className="sp-section-header">
              <div className="sp-logo-circle" onClick={playAudio} role="button" tabIndex={0}>
                <img
                  src="https://ik.imagekit.io/arielgenua/ChatGPT%20Image%206%20abr%202026,%2005_54_51%20p.m..png"
                  alt="Reina Chura"
                />
              </div>
              <h2 className="sp-section-title">Cuántas prendas has vendido<span className="sp-title-accent">?</span></h2>
            </header>

            {/* Recientes */}
            <div className="sp-group">
              <p className="sp-group-label">Recientes</p>
              <div className="sp-recientes-row">
                <button
                  className="sp-card sp-card-reciente sp-card--active"
                  onClick={() => navigate('/selled-products/today')}
                >
                  <span className="sp-card-eyebrow">HOY</span>
                  <span className="sp-card-main">{dd}/{mm}</span>
                </button>
                <button
                  className="sp-card sp-card-reciente sp-card--active"
                  onClick={() => navigate(`/selled-products/week-${currentWeek?.weekNum ?? 1}`)}
                >
                  <span className="sp-card-eyebrow">Esta semana</span>
                  <span className="sp-card-main">{monthName}</span>
                </button>
              </div>
            </div>

            {/* Semanas */}
            <div className="sp-group">
              <p className="sp-group-label">Semanas</p>
              <div className="sp-weeks-scroll">
                {weeks.map((week) => {
                  const ordinals = ['1ra', '2da', '3ra', '4ta', '5ta']
                  const ord = ordinals[week.weekNum - 1] || `${week.weekNum}ta`
                  return (
                    <button
                      key={week.weekNum}
                      className={`sp-card sp-card-week${week.isFuture ? ' sp-card--future' : ''}${week.isCurrent ? ' sp-card--active' : ''}`}
                      onClick={() => !week.isFuture && navigate(`/selled-products/week-${week.weekNum}`)}
                      disabled={week.isFuture}
                    >
                      <span className="sp-card-eyebrow">{ord} semana</span>
                      <span className="sp-card-main sp-card-main--sm">de {monthName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Mes */}
            <div className="sp-group">
              <p className="sp-group-label">Mes</p>
              <button
                className="sp-card sp-card-month"
                onClick={() => navigate('/selled-products/month')}
              >
                <span className="sp-card-eyebrow">Este mes</span>
                <span className="sp-card-main">{monthName}</span>
              </button>
            </div>

          </section>

        </div>
      )}

      <ImageModal
        isOpen={!!modalImage}
        imageSrc={modalImage}
        onClose={() => setModalImage(null)}
      />
    </div>
  )
}

export default Inbox
