import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import checkIcon from '../../assets/icons/icons8-check-96.png';
import qrIcon from '../../assets/icons/icons8-qr-100.png';


function SuccededOrder() {
    const { id } = useParams();
    const { getOrderById } = useFirestoreContext();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                setOrderData(data);
            } catch (error) {
                console.error('Error fetching order:', error);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, getOrderById]);

    return (
        <div style={{
          marginTop: '150px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
           <img src={checkIcon} alt="Check icon" />
            <h1 style={{ 
              color: '#333', 
              fontSize: '24px',
              margin: 0 
            }}>
              LISTO!
            </h1>
          </div>
    
          <h2 style={{
            color: '#666',
            fontSize: '16px',
            marginBottom: '20px'
          }}>
            Podrás ver la información del pedido y el código, en la sección pedidos.
          </h2>
    
          <div style={{
            backgroundColor: '#f2f2f2', 
            display: 'flex',
            borderRadius: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              flex: 1,
              padding: '15px',
              borderRight: '1px solid #0990FF',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>Código del pedido</span>
              <p style={{ margin: '5px 0', color: '#0990FF' }}>
                {orderData?.orderCode || 'N/A'}
              </p>
            </div>
            
            <div style={{
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <button style={{
                backgroundColor: '#F1F7FF',
                border: '1px solid #0990FF',
                borderRadius: '20px',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                VER QR
                <img src={qrIcon} alt="Qr icon" />
              </button>
            </div>
          </div>
    
          <button style={{
            position: 'fixed',
            bottom: '0px',
            left: 0,
            width: '100%',
            backgroundColor: '#0E6FFF',
            color: 'white',
            border: 'none',
            padding: '15px',
            fontSize: '16px'
          }}>
            OK, IR A PEDIDOS
          </button>
        </div>
      );
}

export default SuccededOrder;