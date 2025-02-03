/* eslint-disable react/prop-types */
import { useState } from 'react';
import './styles.css';
import { useOrder } from '../../hooks/useOrder';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ product, cart }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { deleteItem } = useOrder() 

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

  const DeleteConfirmationModal = ({ show, onClose }) => {
    if (!show) return null;
  
    return (
      <div style={styles.modalBackground}>
        <div style={styles.modalContainer}>
          <h2 style={styles.modalText}>Item eliminado</h2>
        </div>
      </div>
    );
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteItem(product); // Llama a la función para eliminar el producto
      setShowModal(true); // Muestra el modal
  
      // Cierra el modal después de 2 segundos
    }
  };


  const styles = {
    modalBackground: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    modalText: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
    },
  };
  console.log(product)
  let itemQuantity = cart[0].quantity


  return (
    <div className="cart-order-card">
      <div className="cart-card-header">
        <h3 className="cart-card-title">{product.name}</h3>
        <span className="cart-product-code">{product.productCode}</span>
      </div>
      
      <div className="cart-card-content">
        <div className="cart-info-grid">
          <div className="cart-info-item">
            <span className="cart-info-label">Color</span>
            <span className="cart-info-value">{product.color}</span>
          </div>
          <div className="cart-info-item">
            <span className="cart-info-label">Cantidad</span>
            <span className="cart-info-value">{itemQuantity}</span>
          </div>
          <div className="cart-info-item">
            <span className="cart-info-label">Tamaño</span>
            <span className="cart-info-value">{product.size}</span>
          </div>
          <div className="cart-info-item">
            <span className="cart-info-label">Stock</span>
            <span className="cart-info-value">{product.stock}</span>
          </div>
          <div className="cart-info-item">
            <span className="cart-info-label">Precio</span>
            <span className="cart-info-value">${product.price}</span>
          </div>
          <div className="cart-info-item cart-total">
            <span className="cart-info-label">Total</span>
            <span className="cart-info-value">${(product.price * itemQuantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="cart-card-actions">
        <button className="cart-modify-button" onClick={() => navigate(`/select-product-amount/${product.id}?in-cart=true`)}>
          Modificar
        </button>
        <button className="cart-delete-button" onClick={handleDelete}>
          Eliminar del pedido
        </button>
      </div>
      
      <div className="cart-card-footer">
        <span className="cart-update-date">Actualizado: {formatDate(product.updatedAt)}</span>
      </div>
    </div>
  );


};

export default OrderCard;