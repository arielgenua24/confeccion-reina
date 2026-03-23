import useFirestoreContext from '../../hooks/useFirestoreContext'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles.css'

function Inbox() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { getOrdersByDateRange, getProductsByOrder } = useFirestoreContext()
  const navigate = useNavigate()

  // Get today's date at midnight
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Fetch only today's orders
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const ordersList = await getOrdersByDateRange(today)
        const ordersWithDetails = await Promise.all(
          ordersList.map(async (order) => {
            const products = await getProductsByOrder(order.id)
            const total = products.reduce((acc, item) => {
              const price = parseFloat(item.productData?.price) || 0
              return acc + (item.stock * price)
            }, 0)
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

  // Calculate daily earnings
  const dailyEarnings = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0)
  }, [orders])

  // Top 5 products of today
  const topProducts = useMemo(() => {
    const productCounts = {}
    orders.forEach(order => {
      order.products?.forEach(item => {
        const productName = item.productData?.name || 'Producto desconocido'
        productCounts[productName] = (productCounts[productName] || 0) + (item.stock || 0)
      })
    })
    return Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [orders])

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-ES')}`
  }

  // Navigate to earnings detail page
  const navigateToEarnings = (period) => {
    navigate(`/inbox/earnings/${period}`)
  }

  return (
    <div className="apple-inbox">
      <LoadingComponent isLoading={isLoading} />

      {!isLoading && (
        <div className="apple-inbox-content">
          <header className="apple-header">
            <h1 className="apple-greeting">Hola! lista para revisar tus ingresos?</h1>
          </header>

          {/* Horizontal Scrollable Cards */}
          <div className="apple-cards-scroll">
            <button
              type="button"
              className="apple-card apple-card-button"
              onClick={() => navigateToEarnings('daily')}
              aria-label="Ver ingresos del día"
            >
              <span className="apple-card-label">Ingresos del día {today.getDate()}/{today.getMonth() + 1}</span>
              <span className="apple-card-amount">{formatCurrency(dailyEarnings)}</span>
              <span className="apple-card-cta">Ver detalle</span>
            </button>

            <button
              type="button"
              className="apple-card apple-card-button"
              onClick={() => navigateToEarnings('weekly')}
              aria-label="Ver ingresos de la semana"
            >
              <span className="apple-card-label">Ingresos de la semana</span>
              <span className="apple-card-cta">Ver detalle</span>
            </button>

            <button
              type="button"
              className="apple-card apple-card-button"
              onClick={() => navigateToEarnings('monthly')}
              aria-label="Ver ingresos del mes"
            >
              <span className="apple-card-label">Ingresos del mes</span>
              <span className="apple-card-cta">Ver detalle</span>
            </button>
          </div>

          {/* Top Products of Today */}
          <section className="apple-section">
            <div className="apple-section-header">
              <h2 className="apple-section-title">Resumen de Elementos</h2>
              <span className="apple-section-badge">5 más vendidos de hoy</span>
            </div>

            <div className="apple-list">
              {topProducts.length > 0 ? (
                topProducts.map(([name, count]) => {
                  const maxCount = topProducts[0][1]
                  const percentage = (count / maxCount) * 100

                  return (
                    <div key={name} className="apple-list-item">
                      <div className="apple-item-info">
                        <span className="apple-item-name">{name}</span>
                        <span className="apple-item-count">{count}</span>
                      </div>
                      <div className="apple-progress-bg">
                        <div
                          className="apple-progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="apple-empty-state">No hay ventas hoy</div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Inbox
