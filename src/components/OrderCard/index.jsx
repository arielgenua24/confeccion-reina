/* eslint-disable react/prop-types */
import { useState } from 'react';
import './styles.css';
import { useOrder } from '../../hooks/useOrder';

const OrderCard = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
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

      <button
      className="delete-from-cart-button"
      onClick={handleDelete}
      style={{
        backgroundColor: "red",
        color: "#fff",
        borderRadius: "20px",
        border: "none",
        padding: "10px 20px",
        cursor: "pointer",
      }}
    >
      Eliminar del pedido
    </button>

    <DeleteConfirmationModal show={showModal} onClose={() => setShowModal(false)} />

    </div>
  );




  
};

export default OrderCard;