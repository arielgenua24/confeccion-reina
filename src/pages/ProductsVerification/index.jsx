import { useState, useEffect } from 'react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from '../../components/Loading';
import { useParams, useSearchParams } from 'react-router-dom';
import QrVerifyProduct from '../../components/QrVerifyProduct';
import ProductVerificationStatus from '../../components/ProductVerificationStatus';
import qrIcon from '../../assets/icons/icons8-qr-100.png';
import { useNavigate } from 'react-router-dom';

import './styles.css';

const ProductVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchByQrEnabled, setisSearchByQrEnabled] = useState(false);
  const { orderId } = useParams();
  const [verifiedProducts, setVerifiedProducts] = useState(0);

  const {  updateOrder, getProductsByOrder } = useFirestoreContext();

  const orderEstado = searchParams.get("orderEstado");
  console.log(orderEstado)

  useEffect(() => {
    const fetchProducts = async () => {
        setLoading(true);
      const productsData = await getProductsByOrder(orderId);
      setProducts(productsData);
      console.log(productsData)
      setLoading(false);
    };
    fetchProducts();
  }, [orderId]);

  const handleVerify = (productId) => {
    console.log(productId)
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.productRef.id === productId && product.verified < product.stock) {
          return { ...product, verified: product.verified + 1 };
        } else if (product.id === productId && product.verified < product.stock) {
          return { ...product, verified: product.verified + 1 };
        }
        return product;
      })
    );
    setisSearchByQrEnabled(false);

  };

  const handleReset = (productId) => {
    if (window.confirm('¿Estás seguro de que empezar de cero la verificacion?')) {
    setProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.id === productId) {
          return { ...product, verified: 0 };
        }
        return product;
      })
    );
  }
  };

  const handleUpdateOrder = async () => {
    try {
      await updateOrder(orderId, {
        "estado": "listo para despachar"
      });
      navigate('/orders');
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      // Aquí podrías agregar alguna notificación de error al usuario
    }
  };

  return (
    <div className="products-verification">
        <LoadingComponent isLoading={loading} />

         { orderEstado !==  'listo para despachar' && <h1>Productos Verificados: {verifiedProducts} de {products.length} </h1>}

        {orderEstado !== 'listo para despachar' && ( 
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem', flexDirection: 'column'}}> 
          <button
                style={{backgroundColor: 'F1F7FF', color: '#0990FF', border: '1px solid #0990FF', display: 'flex' ,justifyContent: 'space-around', alignItems: 'center'}}
                className='btn-verify'
                onClick={() => setisSearchByQrEnabled(true)}
                disabled={(verifiedProducts === products.length)}
              >
                <img src={qrIcon} alt="Qr icon" style={{
                  width: '47px',
                  height: '47px',
              }} />

                Verificar escaner de barras
              </button>
              
        </div>)}

       

      {products.map((product) => (
        <div key={product.id} className="verification-product-item">
          <ProductVerificationStatus orderStatus={orderEstado} product={product} verifiedProducts={verifiedProducts} setVerifiedProducts={setVerifiedProducts}/>

          <h3>Codigo del producto: {product.productData.productCode}</h3>
          {orderEstado == 'listo para despachar' ? (<div className="verification-complete">
          <div className="product-details">
            <p className="stock-info">
              Total verificado: <span>{product.stock} unidades</span>
            </p>
            <div className="product-specs">
              <p>
                <strong>Producto:</strong> {product.productData.name}
              </p>
              <p>
                <strong>Color:</strong> {product.productData.color}
              </p>
              <p>
                <strong>Talle:</strong> {product.productData.size}
              </p>
              <p>
                <strong>Precio:</strong> {product.productData.price}
              </p>
              <div className="total-price-container">
                <p className="total-price">
                  <strong>Total:</strong> 
                  <span>${product.stock * product.productData.price}</span>
                </p>
              </div>
            </div>
          </div>
</div>)
         : (
          <div> 
               <p>
            Verificados: <span>{product.verified}</span> de {product.stock}
          </p>

            <p>
                <strong>Producto:</strong> {product.productSnapshot.name}
              </p>
              <p>
                <strong>Color:</strong> {product.productSnapshot.color}
              </p>
              <p>
                <strong>Talle:</strong> {product.productSnapshot.size}
              </p>
              <p>
                <strong>Precio:</strong> {product.productSnapshot.price}
              </p>
          </div>
           
          
          )}
          {orderEstado !== 'listo para despachar' && (<div><button 
              className='btn-verify'
              onClick={() => handleVerify(product.id)}
              disabled={product.verified >= product.stock}
            >
              Verificar uno manualmente
            </button>
            <button 
            className='btn-verify'
            style={{background: 'red', color: 'white'}}
              onClick={() => handleReset(product.id)}
            >
              Empezar de nuevo la verification
            </button></div>)}
            
          
        </div>
      ))}
      {isSearchByQrEnabled && <QrVerifyProduct  
        handleVerify={handleVerify}
        setisSearchByQrEnabled={setisSearchByQrEnabled}
        
        />}
      
      {verifiedProducts === products.length &&
       ( <button
        onClick={handleUpdateOrder}
        style={{
          position: 'fixed',
          bottom: '1rem', // bottom-4 es 1rem
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#007AFF',
          color: 'white',
          padding: '0.75rem 1.5rem', // px-6 es 1.5rem y py-3 es 0.75rem
          borderRadius: '0.5rem', // rounded-lg es 0.5rem
          transition: 'background-color 0.3s ease', // transition-colors
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
          ':hover': {
            backgroundColor: '#0066CC',
          },
        }}
      >
        Marcar como Listo para Despachar
      </button>)}

    </div>
  );
};

export default ProductVerification;