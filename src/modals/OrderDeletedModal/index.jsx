import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import './styles.css';

function OrderDeletedModal({ summary, onClose }) {
  if (!summary) return null;

  const restoredProducts = summary.restoredProducts || [];
  const skippedProducts = summary.skippedProducts || [];
  const hasRestored = restoredProducts.length > 0;
  const hasSkipped = skippedProducts.length > 0;

  return (
    <div className="orderDeleted-overlay" onClick={onClose}>
      <div className="orderDeleted-content" onClick={(e) => e.stopPropagation()}>
        <div className="orderDeleted-header">
          <h3 className="orderDeleted-title">Orden eliminada</h3>
          <button
            className="orderDeleted-close"
            onClick={onClose}
            aria-label="Cerrar"
            style={{border: 'solid 2px red', cursor: 'pointer' }}
          >
            X       
            </button>
        </div>

        {hasRestored && (
          <>
            <p className="orderDeleted-subtitle">
              Estos productos han vuelto a su stock
            </p>

            <div className="orderDeleted-list">
              {restoredProducts.map((product) => (
                <div className="orderDeleted-item" key={product.productId}>
                  {product.imageUrl && (
                    <div className="orderDeleted-image">
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                  )}
                  <div className="orderDeleted-info">
                    <span className="orderDeleted-name">{product.name}</span>
                    <p className="orderDeleted-stock">
                      Antes de la eliminación de esta orden teníamos{' '}
                      <strong>{product.previousStock}</strong>, vuelven{' '}
                      <strong>{product.restoredQuantity}</strong> → ahora tenemos{' '}
                      <strong className="orderDeleted-confirmed">
                        {product.confirmedStock}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {hasSkipped && (
          <div className="orderDeleted-warning">
            <div className="orderDeleted-warning-header">
              <FaExclamationTriangle />
              <span>
                La orden fue eliminada, pero no se pudo restaurar el stock de
                estos productos:
              </span>
            </div>
            <ul className="orderDeleted-warning-list">
              {skippedProducts.map((product, index) => (
                <li key={`${product.name}-${index}`}>{product.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button className="orderDeleted-done" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export default OrderDeletedModal;
