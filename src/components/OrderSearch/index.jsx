import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Filter, Calendar } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import searchOrders from "../../utils/searchOrder";
import useFirestoreContext from "../../hooks/useFirestoreContext";
import OrderDateCalendar from "../OrderDateCalendar";
import QRButton from "../QrGenerateBtn";
import QRmodal from "../../modals/Qrmodal";
import './styles.css'


// eslint-disable-next-line react/prop-types
function OrderSearch({ isActionEnabled }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // null = no search performed yet; array = results of the last search
  const [results, setResults] = useState(null);
  const [searchedMeta, setSearchedMeta] = useState({ name: '', dateLabel: '' });
  const [QRcode, setQRcode] = useState("");
  const [activeFilters, setActiveFilters] = useState({ readyToDispatch: false });

  const navigate = useNavigate();
  const { getOrdersByDayPrefix } = useFirestoreContext();

  const formatDateLabel = (start, end) => {
    if (isSameDay(start, end)) {
      return format(start, "d 'de' MMMM yyyy", { locale: es });
    }
    return `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`;
  };

  // Open the calendar so the user picks the day / range to search within.
  const openCalendar = () => {
    setError(null);
    setShowCalendar(true);
  };

  // Fetch only the chosen day(s) from Firestore (by document-id prefix), then
  // filter that bounded set by the typed name using the existing util.
  const handleConfirmDate = async (start, end) => {
    setShowCalendar(false);
    setIsLoading(true);
    setError(null);
    try {
      const docs = await getOrdersByDayPrefix(start, end);
      const term = searchTerm.trim();
      const filtered = term ? searchOrders(docs, term) : docs;
      setResults(filtered);
      setSearchedMeta({ name: term, dateLabel: formatDateLabel(start, end) });
    } catch (err) {
      console.error('Error searching orders by date:', err);
      setError('No se pudieron cargar las órdenes. Intenta de nuevo.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsFocused(false);
    setResults(null);
    setError(null);
    setSearchedMeta({ name: '', dateLabel: '' });
  };

  const toggleFilter = (filterKey) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: !prev[filterKey] }));
  };

  // Apply the "ready to dispatch" toggle on top of the fetched results.
  const displayedOrders = useMemo(() => {
    if (!results) return [];
    if (!activeFilters.readyToDispatch) return results;
    return results.filter((order) => {
      const estado = (order?.estado ?? order?.status ?? '').toLowerCase();
      return estado === "listo para despachar";
    });
  }, [results, activeFilters]);

  const hasSearched = results !== null;

  return (
    <div className="order-search-container">
      <div className="search-header">
        <div className={`search-wrapper ${isFocused ? 'focused' : ''}`}>
          <Search className="search-icon" size={20} />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por cliente, dirección, teléfono, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && openCalendar()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !searchTerm && setIsFocused(false)}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <button className="search-date-btn" onClick={openCalendar}>
          <Calendar size={18} /> Elegir fecha
        </button>
        <div className="filter-controls">
          <button
            className={`filter-btn ${activeFilters.readyToDispatch ? 'active' : ''}`}
            onClick={() => toggleFilter('readyToDispatch')}
          >
            <Filter size={16} /> Listos para despachar
          </button>
        </div>
      </div>

      {showCalendar && (
        <OrderDateCalendar
          maxRangeDays={15}
          onConfirm={handleConfirmDate}
          onCancel={() => setShowCalendar(false)}
        />
      )}

      <div className={`results-container ${(hasSearched || isLoading) ? 'visible' : ''}`}>
        {isLoading ? (
          <div className="no-results">Buscando órdenes…</div>
        ) : error ? (
          <div className="no-results">{error}</div>
        ) : hasSearched ? (
          <>
            <div className="search-summary">
              Resultados {searchedMeta.name ? <>para “<strong>{searchedMeta.name}</strong>” </> : null}
              en <strong>{searchedMeta.dateLabel}</strong> · {displayedOrders.length} orden(es)
            </div>
            {displayedOrders.length === 0 ? (
              <div className="no-results">
                {searchedMeta.name
                  ? `No se encontraron órdenes para "${searchedMeta.name}" en esa fecha`
                  : 'No se encontraron órdenes en esa fecha'}
              </div>
            ) : (
              <ul className="results-list">
                {displayedOrders.map((order) => {
                  const status = (order?.estado ?? order?.status ?? "sin estado").toString();
                  const statusClassName = status.toLowerCase().replace(/\s+/g, "-");

                  return (
                    <li
                      key={order.id}
                      className={`result-item ${status === "listo para despachar" ? "ready-to-dispatch" : ""}`}
                    >
                      <div className="order-info">
                        <h3 className="order-code">{order.orderCode}</h3>
                        <div className="search-order-details">
                          <span>Cliente: {order.cliente}</span>
                          <span>Dirección: {order.direccion}</span>
                          <span>Teléfono: {order.telefono}</span>
                          <span>Fecha: {order.fecha}</span>
                          <span className={`status-indicator ${statusClassName}`}>
                            Estado: {status}
                          </span>
                        </div>
                      </div>
                      <div className="order-actions">
                        {isActionEnabled && (
                          <>
                            <QRButton
                              product={order}
                              onQRGenerate={setQRcode}
                            />
                            <button
                              className="verify-button"
                              onClick={() => navigate(`/ProductsVerification/${order.id}/?orderEstado=${status}`)}
                            >
                              Verificar Productos
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : null}
      </div>

      {QRcode && (
        <QRmodal
          QRcode={QRcode}
          setQRcode={setQRcode}
          orderCode={true}
        />
      )}
    </div>
  );
}

export default OrderSearch;
