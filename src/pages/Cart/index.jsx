import { useState, useEffect } from 'react';
import {useOrder} from '../../hooks/useOrder';
import useFirestoreContext from '../../hooks/useFirestoreContext'
import OrderCard from '../../components/OrderCard';
import OrderSummary from '../../components/OrderSumary';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, order } = useOrder();
    const { createOrderWithProducts } = useFirestoreContext()
    console.log(createOrderWithProducts)
    console.log(cart)
    const [products, setProduct] = useState([]);
    const navigate = useNavigate();

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

      const getCurrentDateTime = () => {
        const now = new Date();
        return formatDate(now);
      };

    useEffect(() => {
        if (cart) {
            setProduct(cart);
        }
    }, [cart]);

    const handleSubmit = async () => {
        console.log(products)
        try {
          const currentDateTime = getCurrentDateTime();
          const orderResult = await createOrderWithProducts(
            currentDateTime, 
            order.customerName, 
            order.phone, 
            order.address, 
            products
          );
          console.log("Orden creada:", orderResult);
          navigate('/succeeded-order');
        } catch(e) {
          console.error("Error al crear la orden:", e);
          // Aquí puedes manejar el error, por ejemplo mostrar una notificación al usuario
        }
      };



    return (
        <div>
            <OrderSummary order={order} cart={cart}/>

            <span style={{height: '300px', margin: '20px'}}>DETALLES DE LA ORDEN</span>

            <ul>
                {products.map((item, index) => (
                    <OrderCard key={index} product={item.item} />
                ))}
            </ul>

            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '66px',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 16px',
                boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
            }}>
                <button 
                    onClick={() => handleSubmit()}
                    style={{
                        backgroundColor: '#0FCA37',
                        color: 'white',
                        width: '100%',
                        height: '44px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Finalizar Pedido
                </button>
            </div>
        </div>
    );
};

export default Cart;