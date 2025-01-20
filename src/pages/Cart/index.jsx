import { useState, useEffect } from 'react';
import {useOrder} from '../../hooks/useOrder';
import OrderCard from '../../components/OrderCard';
import OrderSummary from '../../components/OrderSumary';

const Cart = () => {
    const { cart, order } = useOrder();
    const [product, setProduct] = useState([]);

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
        </div>
    );
};

export default Cart;