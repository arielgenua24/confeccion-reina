/* eslint-disable react/prop-types */
// OrderSummary.js
import './styles.css';

const OrderSummary = ({ order, cart }) => {
    console.log(order)
  return (
    <div className="order-summary-container">
      <div className="order-summary-header">
        <h1 className="order-summary-title">Resumen de la Orden</h1>
      </div>
      
      <div className="order-details">
        <div className="customer-info">
          <h2>Datos del Cliente</h2>
          <div className="info-row">
            <span className="info-label">Cliente:</span>
            <span className="info-value">{order.customerName || 'No especificado'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Teléfono:</span>
            <span className="info-value">{order.phone || 'No especificado'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Dirección:</span>
            <span className="info-value">{order.address || 'No especificada'}</span>
          </div>
        </div>

        <div className="products-summary">
          <h2>Productos en Carrito</h2>
          <div className="products-list">
            {cart && cart.map((item, index) => (
              <div key={index} className="product-item">
                <span className="product-name">{item.item.name}</span>
                <span className="product-quantity">Cantidad: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;