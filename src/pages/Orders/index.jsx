import useFirestoreContext from '../../hooks/useFirestoreContext'
import useHybridOrders from '../../hooks/useHybridOrders'
import useLocalOrders from '../../hooks/useLocalOrders'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import QRmodal from '../../modals/Qrmodal';
import QRButton from '../../components/QrGenerateBtn';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import { useOrder } from '../../hooks/useOrder';
import OrderSearch from '../../components/OrderSearch';
import './styles.css'

function Orders() {
  const navigate = useNavigate();

  const [isNewData, setIsNewData] = useState(false)
  const [orders, setOrders] = useState([])
  const [QRcode, setQRcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { deleteOrder } = useFirestoreContext()
  const { getAllOrders } = useHybridOrders()
  const { syncOrder } = useLocalOrders()

  const { setOrdersState } = useOrder();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      // Get orders from both IndexedDB and Firestore
      const allOrders = await getAllOrders()
      setOrders(allOrders)
      setOrdersState((prevState) => [
        ...prevState,
        ...allOrders.map((order) => ({ id: order.id, state: order.estado || order.status }))
      ]);

      setIsLoading(false)
    }
    fetchOrders()

  }, [getAllOrders, isNewData])

  console.log('📊 All orders (local + Firestore):', orders)

  const handleDelete = async (order) => {

    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setIsLoading(true)
      setIsNewData(!isNewData)
      await deleteOrder(order.id);
      setIsLoading(false)
    }

  }

  const handleRetrySync = async (orderId) => {
    if (window.confirm('¿Reintentar sincronización de esta orden?')) {
      setIsLoading(true)
      const success = await syncOrder(orderId)
      if (success) {
        alert('✅ Orden añadida a la cola de sincronización. Se procesará en breve.')
        setIsNewData(!isNewData) // Refresh orders list
      } else {
        alert('❌ Error al reintentar sincronización. Por favor intenta de nuevo.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="orders-container">
       <LoadingComponent isLoading={isLoading} />
      <h1>Órdenes</h1>

      <OrderSearch orders={orders} isActionEnabled={true}/>

      <button 
              style={{
                backgroundColor: '#F1F7FF',
                border: '1px solid #0990FF',
                borderRadius: '20px',
                color: '#0990FF',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            onClick={() => {
              navigate('/qrsearch?redirect=order-data');
            }}> BUSCAR POR QR 
              <img src={qrIcon} alt="Qr icon" style={{
                              width: '30px',
                              height: '30px',
                            }} />
            </button>
         

      <div className="orders-list">
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
                <QRButton
                      product={order}
                      onQRGenerate={setQRcode}
                    />

              <button
                style={{backgroundColor: '#f44336', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem'}}
                onClick={() => {
                  handleDelete(order)
                }}
              > Eliminar
              </button>

          </div>

          {/* Sync Status Indicator */}
          {order.syncStatus === 'pending' && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ffc107',
                animation: 'pulse 1.5s infinite'
              }}></span>
              <span style={{ fontSize: '14px', color: '#856404' }}>
                ⏳ Pendiente de sincronización
              </span>
            </div>
          )}

          {order.syncStatus === 'syncing' && (
            <div style={{
              backgroundColor: '#d1ecf1',
              border: '1px solid #0dcaf0',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                border: '2px solid #0dcaf0',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              <span style={{ fontSize: '14px', color: '#055160' }}>
                🔄 Sincronizando...
              </span>
            </div>
          )}

          {/* ✅ NEW: Failed sync status */}
          {order.syncStatus === 'failed' && (
            <div style={{
              backgroundColor: '#f8d7da',
              border: '2px solid #dc3545',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545'
                }}></span>
                <span style={{ fontSize: '14px', color: '#721c24', fontWeight: 'bold' }}>
                  ❌ Error en la sincronización
                </span>
              </div>
              {order.lastError && (
                <div style={{
                  fontSize: '12px',
                  color: '#721c24',
                  marginBottom: '10px',
                  fontStyle: 'italic'
                }}>
                  Error: {order.lastError}
                </div>
              )}
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <button
                  style={{
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => navigate(`/local-order-verification/${order.id || order.orderId}`)}
                >
                  📦 Verificar Productos (Local)
                </button>
                <button
                  style={{
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => handleRetrySync(order.id || order.orderId)}
                >
                  🔄 Reintentar Sincronización
                </button>
              </div>
            </div>
          )}

          <div className="order-header">
            { order.estado === 'listo para despachar' ?  (<div>
            <span style={{ backgroundColor: '#0FCA37', color: '#fff', padding: '0.5rem', borderRadius: '0.25rem' }}>
              Estado: {order.estado} 🎉
            </span>
            </div>
              ) : <span style={{
                backgroundColor: '#fff9c4', // Amarillo crema
                padding: '0.2rem 0.5rem',
                border: '2px solid #fbc02d',
                borderRadius: '4px',
                marginLeft: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                animation: 'jump 0.5s infinite alternate', // Animación
              }}>Estado: {order.estado}⚠️</span> }

            <h3>Código de orden: {order.orderCode}</h3>
            <p>Fecha: {order.fecha}</p>
          </div>
          <div className="order-details">
            <p><strong>Cliente:</strong> {order.cliente}</p>
            <p><strong>Dirección:</strong> {order.direccion}</p>
            <p><strong>Teléfono:</strong> {order.telefono}</p>
          </div>
          <div className="verify-products">
          {/* Only show this button for synced orders (not failed) */}
          {order.syncStatus !== 'failed' && (
            <button
              className="verify-button"
              onClick={() => navigate(`/ProductsVerification/${order.id}/?orderEstado=${order.estado}`)}
              disabled={order.syncStatus === 'pending' || order.syncStatus === 'syncing'}
              style={{
                opacity: (order.syncStatus === 'pending' || order.syncStatus === 'syncing') ? 0.5 : 1,
                cursor: (order.syncStatus === 'pending' || order.syncStatus === 'syncing') ? 'not-allowed' : 'pointer'
              }}
              title={
                order.syncStatus === 'pending'
                  ? 'Esperando sincronización con Firestore'
                  : order.syncStatus === 'syncing'
                  ? 'Sincronizando...'
                  : ''
              }
            >
              {order.syncStatus === 'pending' || order.syncStatus === 'syncing'
                ? '⏳ Sincronizando...'
                : 'Verificar Productos'}
            </button>
          )}
    </div>
        </div>
      ))}
  </div>

  {QRcode && (
          <QRmodal 
          QRcode={QRcode}
          setQRcode={setQRcode}
          orderCode={true}
          />
      )}
    </div>
  )
}

export default Orders