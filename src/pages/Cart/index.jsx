import { useState, useEffect } from 'react';
import {useOrder} from '../../hooks/useOrder';
import useFirestoreContext from '../../hooks/useFirestoreContext'
import OrderCard from '../../components/OrderCard';
import OrderSummary from '../../components/OrderSumary';
import { useNavigate } from 'react-router-dom';
import { MdOutlineBorderStyle } from 'react-icons/md';

const Cart = () => {
    const { cart, order } = useOrder();
    const [error, setError ] = useState(false)
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
        if(cart.length < 1) {
          setError(true)
          return null
        }
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
          if(orderResult) {
            navigate('/succeeded-order');
          } else {
              setError(true)
              window.scrollTo(0, 0);
          }

          console.log("Orden creada:", orderResult);
          
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
              { cart.length >= 1 ? (
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
                   }}>
                      Finalizar Pedido
                   </button>
                    ) : (
                    <button 
                      onClick={() => navigate('/select-products')}

                    style={{
                      backgroundColor: '#f1f1f1',
                      color: '#000',
                      width: '100%',
                      height: '44px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                  }}> Volver al inventario para agregar productos </button>
                )
              }
               
            </div>

            {error && (
        <div style={{
          backgroundColor: "red",
          color: "#fff",
          borderRadius: "20px",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'Column',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: '10000'
        }}>
             <h1> ERROR, cantidad insuficiente </h1>
             <div>
              <span>Parece que hubo un problema con el stock o tu pedido. Revisa tu stock actual o dile a tu cliente que no tienes suficiente stock </span>
             </div>
          
             <buton 
              style={{width: '100px', 
                padding: '20px' ,
                backgroundColor: '#fff', 
                color: '#000', 
                fontWeight: '400',
                borderRadius: '20px',
                fontSize: '24px'
              }}
              onClick={() => {
                setError(false)
                navigate('/select-products')
              }}
              >Entendido
              </buton>
        </div>
              )}
        </div>
    );
};

export default Cart;