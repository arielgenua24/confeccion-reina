import useFirestoreContext from '../../hooks/useFirestoreContext'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect } from 'react'
import './styles.css'

function Inbox() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const { filterOrdersByDate, getProductsByOrder } = useFirestoreContext()

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const ordersList = await filterOrdersByDate()
        const ordersWithDetails = await Promise.all(
          ordersList.map(async (order) => {
            const products = await getProductsByOrder(order.id)
            const total = products.reduce((acc, item) => {
              const price = parseFloat(item.productData.price) || 0
              return acc + (item.stock * price)
            }, 0)
            
            return {
              ...order,
              total,
              clientName: order.client?.name || 'Cliente no especificado',
              address: order.client?.address || 'Dirección no especificada',
              formattedDate: new Date(order.createdAt?.seconds * 1000).toLocaleDateString('es-ES')
            }
          })
        )
        setOrders(ordersWithDetails)
      } catch (error) {
        console.error("Error fetching orders:", error)
      }
      setIsLoading(false)
    }
    
    fetchOrders()
  }, [filterOrdersByDate, getProductsByOrder])
  console.log(orders)

  return (
    <div className="inbox-container">
      <LoadingComponent isLoading={isLoading} />
      
      {!isLoading && (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="card-header">
                <span className="order-date">{order.fecha}</span>
                <div className="confetti">🎉</div>
              </div>
              
              <div className="card-content">
                <div className="total-display" style={{ backgroundColor: '#0FCA37' }}>
                  <span className="total-text"> Haz ganado: ${order.total.toLocaleString('es-ES')}</span>
                </div>
                
                <div className="order-details">
                  <p className="detail-line">
                    Pedido número: <strong>#{order.orderCode}</strong>
                  </p>
                  <p className="detail-line">
                    Cliente: <strong>{order.cliente}</strong>
                  </p>
                  <p className="detail-line">
                    Dirección: <em>{order.direccion}</em>
                  </p>
                  <p className="detail-line">
                    Telefono: <em>{order.telefono}</em>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Inbox;