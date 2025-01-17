import { useNavigate, useLocation } from 'react-router-dom'
import { IoArrowBack } from "react-icons/io5"


function BackNav() {
    const navigate = useNavigate();
    const location = useLocation();

    console.log(location.pathname)
    
    if(location.pathname !== '/' && location.pathname !== '/home') {
        return (
            <nav style={{
              height: '44px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              borderBottom: '1px solid #e0e0e0' }}>
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
            </nav>
          ) 
    }

   
}

export default BackNav;