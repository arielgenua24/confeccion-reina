import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useLocalOrders from '../../hooks/useLocalOrders';
import checkIcon from '../../assets/icons/icons8-check-96.png';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import QRmodal from '../../modals/Qrmodal';


function SuccededOrder() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getOrderById } = useLocalOrders();
    const [orderData, setOrderData] = useState(null);
    const [qrCode, setQrCode] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                console.log('📦 Fetching order from IndexedDB:', id);
                const data = await getOrderById(id);
                console.log('📦 Order data:', data);
                setOrderData(data);
            } catch (error) {
                console.error('❌ Error fetching order:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, getOrderById]);

    if (isLoading) {
        return (
            <div style={{
                marginTop: '20px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
            }}>
                <p>Cargando pedido...</p>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div style={{
                marginTop: '20px',
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif'
            }}>
                <p>No se encontró el pedido</p>
                <button onClick={() => navigate('/orders')} style={{
                    backgroundColor: '#0E6FFF',
                    color: 'white',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    marginTop: '20px'
                }}>
                    IR A PEDIDOS
                </button>
            </div>
        );
    }

    return (
        <div style={{
          marginTop: '20px',
          fontFamily: 'Arial, sans-serif',
          paddingBottom: '80px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
           <img src={checkIcon} alt="Check icon"
            style={{
              width: '47px',
              height: '47px',
            }}

           />
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
            marginBottom: '20px',
            marginTop: '75px',
            textAlign: 'center',
            padding: '0 20px'
          }}>
            {orderData.syncStatus === 'synced'
              ? 'Pedido creado y sincronizado exitosamente'
              : 'Pedido creado. Se sincronizará automáticamente cuando haya conexión.'}
          </h2>

          <div style={{
            backgroundColor: '#f2f2f2',
            display: 'flex',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '0 20px'
          }}>
            <div style={{
              flex: 1,
              padding: '15px',
              borderRight: '1px solid #0990FF',
              textAlign: 'center'
            }}>
              <span style={{ fontWeight: 'bold' }}>Código del pedido</span>
              <p style={{ margin: '5px 0', color: '#0990FF', fontSize: '18px' }}>
                {orderData.orderCode}
              </p>
            </div>
            
            <div style={{
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <button 
                onClick={() => {
                  setQrCode(orderData)
                  console.log(orderData.orderCode)
                
                }}
                style={{
                backgroundColor: '#F1F7FF',
                border: '1px solid #0990FF',
                borderRadius: '20px',
                color: '#0990FF',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                VER QR
                <img src={qrIcon} alt="Qr icon" style={{
                  width: '47px',
                  height: '47px',
                }} />
              </button>
            </div>
          </div>
    
          <button 
          onClick={() => {
            navigate('/orders');
          }}
          style={{
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
          {qrCode && <QRmodal QRcode={orderData} setQRcode={setQrCode} orderCode={true} />}

        </div>
      );
}

export default SuccededOrder;