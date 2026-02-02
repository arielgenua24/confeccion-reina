import { useState, useEffect } from 'react';
import { useOrder } from '../../hooks/useOrder';
import useLocalOrders from '../../hooks/useLocalOrders';
import OrderCard from '../../components/OrderCard';
import OrderSummary from '../../components/OrderSumary';
import { useNavigate } from 'react-router-dom';
import LoadingComponent from '../../components/Loading';
import ImageModal from '../../components/ImageModal';
import './styles.css'; // Import new Airbnb styles

const Cart = () => {
  const { cart, order, resetOrderValues } = useOrder();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { createOrder, isCreating } = useLocalOrders();

  const [products, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  // Calculate Total Price
  const totalPrice = cart.reduce((acc, item) => {
    const price = item.product?.price || item.item?.price || 0;
    const quantity = item.quantity || 1;
    return acc + (price * quantity);
  }, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    if (cart) {
      setProduct(cart);
    }
  }, [cart]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(false);
    setErrorMessage('');

    // Validate cart not empty
    if (cart.length < 1) {
      setError(true);
      setErrorMessage('El carrito está vacío');
      setIsLoading(false);
      return null;
    }

    const customerData = {
      customerName: order.customerName || 'Cliente sin nombre',
      phone: order.phone || 'Sin teléfono',
      address: order.address || 'Sin dirección'
    };

    console.log('🚀 Creating optimistic order with cart:', cart);

    try {
      const result = await createOrder(customerData, cart);

      if (result.success) {
        console.log(`✅ Order created in ${result.duration.toFixed(2)}ms: ${result.orderId}`);
        resetOrderValues();
        navigate(`/succeeded-order/${result.orderId}`);
        setIsLoading(false);
      } else {
        console.error('❌ Order creation failed:', result.error);
        setError(true);
        setErrorMessage(result.error || 'Error al crear la orden');
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    } catch (e) {
      setIsLoading(false);
      setError(true);
      setErrorMessage(e.message || 'Error inesperado al crear la orden');
      console.error("❌ Error al crear la orden:", e);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="cart-page-container">
      <LoadingComponent isLoading={isLoading || isCreating} />

      <div className="cart-header">
        <h1 className="cart-title">Tu Carrito</h1>
        <p className="cart-subtitle">{cart.length} {cart.length === 1 ? 'producto' : 'productos'} seleccionados</p>
      </div>

      <OrderSummary order={order} cart={cart} />

      <h2 className="cart-section-title">Detalles del pedido</h2>

      <ul className="cart-items-list">
        {products.map((item, index) => {
          const product = item.product || item.item;
          const variants = item.selectedVariants || { size: item.item?.size || null, color: item.item?.color || null };
          return <OrderCard
            key={index}
            product={product}
            quantity={item.quantity}
            selectedVariants={variants}
            onImageClick={(url) => setSelectedImage(url)}
          />
        })}
      </ul>

      {/* Airbnb Style Sticky Footer */}
      <div className="cart-footer">
        {cart.length >= 1 ? (
          <>
            <div className="cart-total-container">
              <span className="cart-total-label">Total estimado</span>
              <span className="cart-total-amount">{formatPrice(totalPrice)}</span>
            </div>

            <button
              className="cart-checkout-btn"
              onClick={() => handleSubmit()}
            >
              Finalizar Pedido
            </button>
          </>
        ) : (
          <button
            className="cart-back-btn"
            onClick={() => navigate('/select-products')}
          >
            Volver al inventario
          </button>
        )}
      </div>

      {error && (
        <div className="cart-error-overlay">
          <div className="cart-error-content">
            <h1 className="cart-error-title">¡Ups! Algo salió mal</h1>
            <p className="cart-error-message">
              {errorMessage || 'Parece que hubo un problema con el stock o tu pedido. Revisa tu stock actual.'}
            </p>
            <button
              className="cart-error-btn"
              onClick={() => {
                setError(false);
                setErrorMessage('');
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default Cart;