import { useNavigate, useLocation } from 'react-router-dom'
import { IoArrowBack } from "react-icons/io5"
import { useOrder } from '../../hooks/useOrder';
import { useState, useEffect } from 'react';


function BackNav() {
  const [cartCount, setCartCount] = useState(0)

    const navigate = useNavigate();
    const location = useLocation();

    const { cart } = useOrder(); // obtenemos findItems del localStorage

    useEffect(() => {
      // Actualizar el contador cuando cambie finditems en el localStorage
      if (cart) {
        setCartCount(cart.length);
        console.log(cart.length)
      }
    }, [cart]);


    const navStyle = {
      height: '44px',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px', borderBottom: '1px solid #e0e0e0'
    }
    
    if(location.pathname !== '/' && location.pathname !== '/home') {
        return (
            <nav style={navStyle}>
              <button 
                onClick={() => navigate('/home')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <IoArrowBack size={24} />
              </button>

              <div className="relative">
          <button
            onClick={() => navigate('/cart')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            Carrito
            {cartCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartCount}
              </div>
            )}
          </button>
        </div>

            </nav>
          ) 
    }

   
}

export default BackNav;