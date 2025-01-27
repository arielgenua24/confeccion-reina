import useFirestoreContext from '../../hooks/useFirestoreContext'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './styles.css'

function Orders() {
  const navigate = useNavigate();

  const [isNewData, setIsNewData] = useState(false)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const {filterOrdersByDate,  updateOrder,
    deleteOrder, } = useFirestoreContext()

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      const orders = await filterOrdersByDate()
      setOrders(orders)
      setIsLoading(false)
    }
    fetchOrders()
   
  }, [filterOrdersByDate, isNewData])
  
  console.log(orders)

  const handleDelete = async (order) => {
   
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsLoading(true)
      setIsNewData(!isNewData)
      await deleteOrder(order.id);
      setIsLoading(false)
    }
   
  }

  return (
    <div className="orders-container">
       <LoadingComponent isLoading={isLoading} />
      <h1>Órdenes</h1>
      <div className="orders-list">
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <button 
            className="delete-button"
            onClick={() => {
              handleDelete(order)
            }}
          > Eliminar
          </button>
          <div className="order-header">
            <span>Estado: {order.estado}</span>
            <h3>Código de orden: {order.orderCode}</h3>
            <p>Fecha: {order.fecha}</p>
          </div>
          <div className="order-details">
            <p><strong>Cliente:</strong> {order.cliente}</p>
            <p><strong>Dirección:</strong> {order.direccion}</p>
            <p><strong>Teléfono:</strong> {order.telefono}</p>
          </div>
          <div className="verify-products">
          <button 
            className="verify-button"
            onClick={() => navigate(`/ProductsVerification/${order.id}`)}
          >
            Verificar Productos
          </button>
    </div>
        </div>
      ))}
  </div>

    </div>
  )
}

export default Orders