import useFirestoreContext from '../../hooks/useFirestoreContext'
import { useState, useEffect } from 'react'
import './styles.css'

function Orders() {
  const [orders, setOrders] = useState([])
  const { getOrders, filterOrdersByDate } = useFirestoreContext()

  useEffect(() => {
    const fetchOrders = async () => {
      const orders = await filterOrdersByDate()
      setOrders(orders)
    }
    fetchOrders()
  }, [filterOrdersByDate])
  
  console.log(orders)

  return (
    <div className="orders-container">
      <h1>Órdenes</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h3>Código de orden: {order.orderCode}</h3>
             <p>Fecha: {order.fecha}</p>
            </div>
            <div className="order-details">
              <p><strong>Cliente:</strong> {order.cliente}</p>
              <p><strong>Dirección:</strong> {order.direccion}</p>
              <p><strong>Teléfono:</strong> {order.telefono}</p>
            </div>
            <div className="products-list">
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders