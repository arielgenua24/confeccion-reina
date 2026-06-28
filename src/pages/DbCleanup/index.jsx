import { useState, useCallback, useEffect, useRef } from 'react';
import { Trash2, Lock, Loader2 } from 'lucide-react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import {
  deletePendingOrder,
  deleteOrderHistory,
  deleteSyncTasksByOrderId,
} from '../../services/cacheService';
import './styles.css';

const PASSWORD = 'Ariel2001';
const OLD_ORDER_DAYS = 75;
const PAGE_SIZE = 400;
const LONG_PRESS_MS = 450;

// Cutoff date shown in the header (orders strictly older than this are listed).
function getCutoffDate() {
  return new Date(Date.now() - OLD_ORDER_DAYS * 86400000);
}

// Firestore Timestamp | Date | ISO string -> Date
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

function formatDate(date) {
  if (!date || isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function daysAgo(date) {
  if (!date || isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

// Amount with no extra reads: prefer stored totalAmount, fall back to the
// embedded products array (Σ price × stock), like the inbox earnings view.
function getAmount(order) {
  if (typeof order.totalAmount === 'number') return order.totalAmount;
  if (Array.isArray(order.products) && order.products.length) {
    const total = order.products.reduce((acc, item) => {
      const price = parseFloat(item?.productSnapshot?.price ?? item?.productData?.price ?? item?.price) || 0;
      const qty = Number(item?.stock ?? item?.quantity) || 0;
      return acc + price * qty;
    }, 0);
    if (total > 0) return total;
  }
  return null;
}

function formatCurrency(value) {
  if (value == null) return '—';
  return `$${Number(value).toLocaleString('es-ES')}`;
}

function DbCleanup() {
  const { getOldOrdersPaginated, forceDeleteOrder } = useFirestoreContext();

  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selected, setSelected] = useState(() => new Set());
  const selectionMode = selected.size > 0;

  const longPressTimer = useRef(null);

  const cutoff = getCutoffDate();

  // ----- Auth -----
  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // ----- Data loading -----
  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getOldOrdersPaginated(PAGE_SIZE, null);
      setOrders(result.orders);
      setLastVisibleDoc(result.lastVisibleDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error cargando pedidos antiguos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getOldOrdersPaginated]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !lastVisibleDoc) return;
    setIsLoadingMore(true);
    try {
      const result = await getOldOrdersPaginated(PAGE_SIZE, lastVisibleDoc);
      setOrders((prev) => [...prev, ...result.orders]);
      setLastVisibleDoc(result.lastVisibleDoc);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error cargando más pedidos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, lastVisibleDoc, getOldOrdersPaginated]);

  useEffect(() => {
    if (unlocked) loadInitial();
  }, [unlocked, loadInitial]);

  // ----- Deletion (no confirm: the 75-day filter is the only safeguard) -----
  const purgeLocalTraces = async (id) => {
    // Best-effort: stop a stale local copy from reviving the order.
    try { await deletePendingOrder(id); } catch { /* noop */ }
    try { await deleteOrderHistory(id); } catch { /* noop */ }
    try { await deleteSyncTasksByOrderId(id); } catch { /* noop */ }
  };

  const deleteOne = async (id) => {
    setIsDeleting(true);
    try {
      await forceDeleteOrder(id);
      await purgeLocalTraces(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      alert('Error al eliminar el pedido. Intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setIsDeleting(true);
    try {
      await Promise.allSettled(
        ids.map(async (id) => {
          await forceDeleteOrder(id);
          await purgeLocalTraces(id);
        })
      );
      const idSet = new Set(ids);
      setOrders((prev) => prev.filter((o) => !idSet.has(o.id)));
      setSelected(new Set());
    } catch (error) {
      console.error('Error eliminando pedidos:', error);
      alert('Error al eliminar los pedidos. Intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete every order currently loaded on the page, then refresh with the
  // next-oldest batch (deleted orders are gone, so the query returns the rest).
  const deleteAllOnPage = async () => {
    const ids = orders.map((o) => o.id);
    if (!ids.length) return;
    setIsDeleting(true);
    try {
      await Promise.allSettled(
        ids.map(async (id) => {
          await forceDeleteOrder(id);
          await purgeLocalTraces(id);
        })
      );
      setSelected(new Set());
      setLastVisibleDoc(null);
      await loadInitial();
    } catch (error) {
      console.error('Error eliminando los pedidos de la página:', error);
      alert('Error al eliminar los pedidos. Intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ----- Long-press multi-select -----
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startLongPress = (id) => {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      toggleSelect(id);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleRowClick = (id) => {
    // In selection mode a normal tap toggles the row.
    if (selectionMode) toggleSelect(id);
  };

  // ----- Render: password gate -----
  if (!unlocked) {
    return (
      <div className="dbc-gate">
        <form className="dbc-gate-card" onSubmit={handleUnlock}>
          <Lock size={32} className="dbc-gate-icon" />
          <h1 className="dbc-gate-title">Limpieza de base de datos</h1>
          <p className="dbc-gate-sub">Ingresá la contraseña para continuar</p>
          <input
            type="password"
            className={`dbc-gate-input ${passwordError ? 'dbc-gate-input--error' : ''}`}
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            placeholder="Contraseña"
            autoFocus
          />
          {passwordError && <span className="dbc-gate-error">Contraseña incorrecta</span>}
          <button type="submit" className="dbc-gate-btn">Entrar</button>
        </form>
      </div>
    );
  }

  // ----- Render: tool -----
  return (
    <div className="dbc-container">
      <div className="dbc-header">
        <h1 className="dbc-title">Limpieza de pedidos</h1>
        <p className="dbc-sub">
          Mostrando pedidos anteriores al <strong>{formatDate(cutoff)}</strong> (más de {OLD_ORDER_DAYS} días),
          del más antiguo al más reciente. La eliminación es permanente y no devuelve stock.
        </p>
      </div>

      {!isLoading && orders.length > 0 && (
        <button
          className="dbc-delete-page-btn"
          onClick={deleteAllOnPage}
          disabled={isDeleting}
        >
          <Trash2 size={18} />
          Eliminar todos los de esta página ({orders.length})
        </button>
      )}

      {selectionMode && (
        <div className="dbc-bulk-bar">
          <button
            className="dbc-bulk-btn"
            onClick={deleteSelected}
            disabled={isDeleting}
          >
            <Trash2 size={18} />
            Eliminar todas juntas ({selected.size})
          </button>
          <button className="dbc-bulk-cancel" onClick={() => setSelected(new Set())}>
            Cancelar
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="dbc-state">
          <Loader2 size={28} className="dbc-spin" />
          <span>Cargando pedidos…</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="dbc-state">
          <span>No hay pedidos de más de {OLD_ORDER_DAYS} días para eliminar. 🎉</span>
        </div>
      ) : (
        <ul className="dbc-list">
          {orders.map((order) => {
            const date = toDate(order.createdAt);
            const age = daysAgo(date);
            const isSelected = selected.has(order.id);
            return (
              <li
                key={order.id}
                className={`dbc-row ${isSelected ? 'dbc-row--selected' : ''}`}
                onClick={() => handleRowClick(order.id)}
                onTouchStart={() => startLongPress(order.id)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onMouseDown={() => startLongPress(order.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
              >
                <div className="dbc-row-info">
                  <span className="dbc-row-date">{formatDate(date)}</span>
                  {age != null && <span className="dbc-row-age">hace {age} días</span>}
                </div>
                <span className="dbc-row-amount">{formatCurrency(getAmount(order))}</span>
                {isSelected ? (
                  <span className="dbc-row-check">✓</span>
                ) : (
                  <button
                    className="dbc-row-delete"
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne(order.id);
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && hasMore && orders.length > 0 && (
        <button className="dbc-load-more" onClick={loadMore} disabled={isLoadingMore}>
          {isLoadingMore ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
      {!isLoading && !hasMore && orders.length > 0 && (
        <p className="dbc-end">No hay más pedidos antiguos.</p>
      )}
    </div>
  );
}

export default DbCleanup;
