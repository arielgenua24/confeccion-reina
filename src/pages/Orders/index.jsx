import useFirestoreContext from '../../hooks/useFirestoreContext'
import useHybridOrders from '../../hooks/useHybridOrders'
import useLocalOrders from '../../hooks/useLocalOrders'
import LoadingComponent from '../../components/Loading'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import QRmodal from '../../modals/Qrmodal';
import OrderDeletedModal from '../../modals/OrderDeletedModal';
import QRButton from '../../components/QrGenerateBtn';
import ClientShareActions from '../../components/ClientShareActions';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import { useOrder } from '../../hooks/useOrder';
import OrderSearch from '../../components/OrderSearch';
import SyncingOrderBanner from '../../components/SyncingOrderBanner';
import syncEvents from '../../services/syncEvents';
import './styles.css'

const ORDERS_PER_PAGE = 10;

function Orders() {
  const navigate = useNavigate();

  const [isNewData, setIsNewData] = useState(false)
  const [localOrders, setLocalOrders] = useState([])
  const [firestoreOrders, setFirestoreOrders] = useState([])
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [QRcode, setQRcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuOrderId, setOpenMenuOrderId] = useState(null);
  const [deletionSummary, setDeletionSummary] = useState(null);

  const { deleteOrder, getOrderById } = useFirestoreContext()
  const { getLocalOrders, getFirestoreOrdersPage } = useHybridOrders()
  const { syncOrder } = useLocalOrders()

  const { setOrdersState } = useOrder();

  // Combined array for OrderSearch and rendering
  const allLoadedOrders = useMemo(() => {
    return [...localOrders, ...firestoreOrders];
  }, [localOrders, firestoreOrders]);

  // Load local orders + first page of Firestore orders
  const loadInitialOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const [localResult, firestoreResult] = await Promise.all([
        getLocalOrders(),
        getFirestoreOrdersPage(ORDERS_PER_PAGE, null)
      ]);

      setLocalOrders(localResult);
      setFirestoreOrders(firestoreResult.orders);
      setLastVisibleDoc(firestoreResult.lastVisibleDoc);
      setHasMore(firestoreResult.hasMore);

      const allOrders = [...localResult, ...firestoreResult.orders];
      setOrdersState((prevState) => [
        ...prevState,
        ...allOrders.map((order) => ({ id: order.id, state: order.estado || order.status }))
      ]);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false)
    }
  }, [getLocalOrders, getFirestoreOrdersPage]);

  // Load next page of Firestore orders
  const loadMoreOrders = useCallback(async () => {
    if (isLoadingMore || !hasMore || !lastVisibleDoc) return;
    setIsLoadingMore(true);
    try {
      const result = await getFirestoreOrdersPage(ORDERS_PER_PAGE, lastVisibleDoc);
      setFirestoreOrders(prev => [...prev, ...result.orders]);
      setLastVisibleDoc(result.lastVisibleDoc);
      setHasMore(result.hasMore);

      setOrdersState((prevState) => [
        ...prevState,
        ...result.orders.map((order) => ({ id: order.id, state: order.estado || order.status }))
      ]);
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, lastVisibleDoc, getFirestoreOrdersPage]);

  useEffect(() => {
    loadInitialOrders()
  }, [loadInitialOrders, isNewData])

  // Auto-update a card when its order finishes syncing to Firestore in the
  // background, so the employee never has to leave and re-enter the page.
  useEffect(() => {
    const unsubscribe = syncEvents.subscribe(async (eventType, data) => {
      if (eventType !== 'order_synced') return;
      const syncedId = data?.orderId;
      if (!syncedId) return;

      // Read the Firestore version FIRST, then swap lists in one batched
      // update so the card flips straight to "synced" without blinking out.
      try {
        const syncedOrder = await getOrderById(syncedId);
        if (!syncedOrder) return;

        setLocalOrders(prev => prev.filter(o => (o.id || o.orderId) !== syncedId));
        setFirestoreOrders(prev =>
          prev.some(o => o.id === syncedId)
            ? prev
            : [{ ...syncedOrder, syncStatus: 'synced', isLocal: false }, ...prev]
        );
      } catch (error) {
        console.error('Error refreshing synced order:', error);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (order) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta orden? El stock de los productos será restaurado.')) {
      setIsLoading(true)
      try {
        const result = await deleteOrder(order.id);
        // Remove from the appropriate list
        if (order.isLocal) {
          setLocalOrders(prev => prev.filter(o => o.id !== order.id));
        } else {
          setFirestoreOrders(prev => prev.filter(o => o.id !== order.id));
        }
        setDeletionSummary({
          orderCode: order.orderCode,
          restoredProducts: result?.restoredProducts || [],
          skippedProducts: result?.skippedProducts || []
        });
      } catch (error) {
        console.error('Error al eliminar la orden:', error);
        alert('Error al eliminar la orden. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleRetrySync = async (orderId) => {
    setOpenMenuOrderId(null);
    if (window.confirm('¿Reintentar sincronización de esta orden?')) {
      setIsLoading(true)
      const success = await syncOrder(orderId)
      if (success) {
        alert('✅ Orden añadida a la cola de sincronización. Se procesará en breve.')
        setIsNewData(!isNewData)
      } else {
        alert('❌ Error al reintentar sincronización. Por favor intenta de nuevo.')
      }
      setIsLoading(false)
    }
  }

  const toggleMenu = (orderId) => {
    setOpenMenuOrderId(openMenuOrderId === orderId ? null : orderId);
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuOrderId) {
        setOpenMenuOrderId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuOrderId]);

  const renderOrderCard = (order) => {
    const isNotSynced = order.syncStatus === 'pending' || order.syncStatus === 'syncing' || order.syncStatus === 'failed';
    const isMenuOpen = openMenuOrderId === (order.id || order.orderId);

    return (
      <div key={order.id} className="order-card">
        <div className="order-card-top">
          <div className="order-identity">
            <span className="order-label">Orden</span>
            <h3 className="order-code">#{order.orderCode}</h3>
            <span className="order-date">Fecha: {order.fecha}</span>
          </div>
          <span className={`status-pill ${order.estado === 'listo para despachar' ? 'ready' : 'attention'}`}>
            Estado: {order.estado}
          </span>
        </div>

        {/* Sync Status Indicator */}
        {(order.syncStatus === 'pending' || order.syncStatus === 'syncing') && (
          <SyncingOrderBanner
            orderId={order.id || order.orderId}
            onRetry={handleRetrySync}
          />
        )}

        {/* Failed sync status - Only show error and local verification */}
        {order.syncStatus === 'failed' && (
          <div className="sync-banner sync-banner--failed">
            <div className="sync-banner-left">
              <span className="sync-dot sync-dot--danger"></span>
              <span>Error en la sincronización</span>
            </div>
            {order.lastError && (
              <div className="sync-error">
                Error: {order.lastError}
              </div>
            )}
            <div className="sync-actions">
              <button
                className="primary-btn"
                onClick={() => navigate(`/local-order-verification/${order.id || order.orderId}`)}
              >
                Verificar productos (local)
              </button>
            </div>
          </div>
        )}

        <div className="order-details">
          <div className="order-detail">
            <span className="detail-label">Cliente</span>
            <span className="detail-value">{order.cliente}</span>
          </div>
          <div className="order-detail">
            <span className="detail-label">Dirección</span>
            <span className="detail-value">{order.direccion}</span>
          </div>
          <div className="order-detail">
            <span className="detail-label">Teléfono</span>
            <span className="detail-value">{order.telefono}</span>
          </div>
        </div>

        <div className="order-actions">
          <div className="order-actions-row">
            <span className="actions-label">Compartir con cliente</span>
            <div className="share-buttons-container">
              <ClientShareActions order={order} variant="compact" />
            </div>
          </div>

          {!(order.syncStatus === 'pending' || order.syncStatus === 'syncing') && (
          <div className="order-actions-row">
            <span className="actions-label">Acciones de orden</span>
            <div className="order-actions-right">
              {!isNotSynced && (
                <QRButton
                  product={order}
                  onQRGenerate={setQRcode}
                />
              )}

              {order.syncStatus === 'failed' && (
                <div className="menu-wrapper">
                  <button
                    className="menu-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(order.id || order.orderId);
                    }}
                  >
                    Opciones <span>⋮</span>
                  </button>

                  {isMenuOpen && (
                    <div className="floating-menu" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="menu-item"
                        onClick={() => handleRetrySync(order.id || order.orderId)}
                      >
                        Reintentar sincronización
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isNotSynced && (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(order)}
                >
                  Eliminar orden
                </button>
              )}
            </div>
          </div>
          )}

          {!isNotSynced && (
            <button
              className="verify-button"
              onClick={() => navigate(`/ProductsVerification/${order.id}/?orderEstado=${order.estado}`)}
            >
              Verificar productos
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="orders-container">
       <LoadingComponent isLoading={isLoading} />
      <div className="orders-header">
        <div className="orders-title">
          <h1>Órdenes</h1>
          <p>Revisa, comparte y gestiona cada orden en segundos.</p>
        </div>
        <button
          className="qr-search-btn"
          onClick={() => {
            navigate('/qrsearch?redirect=order-data');
          }}
        >
          Buscar por QR
          <img src={qrIcon} alt="Qr icon" />
        </button>
      </div>

      <OrderSearch orders={allLoadedOrders} isActionEnabled={true}/>


      <div className="orders-list">
        {allLoadedOrders.map(renderOrderCard)}
      </div>

      {isLoadingMore && <LoadingComponent isLoading={true} />}
      {!isLoadingMore && hasMore && firestoreOrders.length > 0 && (
        <button onClick={loadMoreOrders} className="load-more-orders-btn">
          Cargar más órdenes
        </button>
      )}
      {!isLoadingMore && !hasMore && firestoreOrders.length > 0 && (
        <p className="no-more-orders-text">
          No hay más órdenes para mostrar
        </p>
      )}

      {QRcode && (
        <QRmodal
          QRcode={QRcode}
          setQRcode={setQRcode}
          orderCode={true}
        />
      )}

      {deletionSummary && (
        <OrderDeletedModal
          summary={deletionSummary}
          onClose={() => setDeletionSummary(null)}
        />
      )}
    </div>
  )
}

export default Orders
