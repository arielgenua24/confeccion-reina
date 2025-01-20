/* eslint-disable react/prop-types */
// OrderCard.js
import './styles.css';

const OrderCard = ({ product }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-card">
      <div className="card-header">
        <h3 className="card-title">{product.name}</h3>
        <span className="product-code">{product.productCode}</span>
      </div>
      
      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Color</span>
            <span className="info-value">{product.color}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tamaño</span>
            <span className="info-value">{product.size}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Stock</span>
            <span className="info-value">{product.stock}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Precio</span>
            <span className="info-value">${product.price}</span>
          </div>
        </div>
      </div>
      
      <div className="card-footer">
        <span className="update-date">
          Actualizado: {formatDate(product.updatedAt)}
        </span>
      </div>
    </div>
  );
};

export default OrderCard;