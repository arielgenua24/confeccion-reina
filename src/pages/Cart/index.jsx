import { useState, useEffect } from 'react';
import {useOrder} from '../../hooks/useOrder';
import OrderCard from '../../components/OrderCard';
import OrderSummary from '../../components/OrderSumary';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, order } = useOrder();
    const [product, setProduct] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (cart) {
            setProduct(cart);
        }
    }, [cart]);

    return (
        <div>
            <OrderSummary order={order} cart={cart}/>

            <span style={{height: '300px', margin: '20px'}}>DETALLES DE LA ORDEN</span>

            <ul>
                {product.map((item, index) => (
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
                    onClick={() => navigate('/succeeded-order')}
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