import { useState } from 'react';
import {Link } from 'react-router-dom'
import { useOrder } from '../../hooks/useOrder';


function Home() {
    const { order } = useOrder();

      const [customerData, setCustomerData] = useState({
        customerName: order.customerName || '',
        phone: order.phone || '',
        address: order.address || '',
      });

   


    const areProductsInOrder = order.products.length

    return (
      <div className="app-container">
        <div className="orders-section">
          <Link to="/new-order">
          {!areProductsInOrder ? 
            (<button className="pages-btn">Nuevo Pedido</button> ):
            (<button className="pages-btn">Continuar el pedido de {customerData.customerName} </button> )
        }
            
          </Link>
          <Link to="/orders">
            <button className="pages-btn">orders</button>
          </Link>
        </div>
        <Link to="/inventory">
          <button className="pages-btn">Catálogo</button>
        </Link>
      </div>
    );
  }
export default Home;  