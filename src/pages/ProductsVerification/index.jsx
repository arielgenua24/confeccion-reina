import { useState, useEffect } from 'react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from '../../components/Loading';
import { useParams } from 'react-router-dom';
import QrVerifyProduct from '../../components/QrVerifyProduct';
import ProductVerificationStatus from '../../components/ProductVerificationStatus';

import './styles.css';

const ProductVerification = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchByQrEnabled, setisSearchByQrEnabled] = useState(false);
  const { orderId } = useParams();
  const [verifiedProducts, setVerifiedProducts] = useState(0);

  const {  updateOrder, getProductsByOrder } = useFirestoreContext();

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
    setProducts(prevProducts =>
      prevProducts.map(product => {
        if (product.id === productId) {
          return { ...product, verified: 0 };
        }
        return product;
      })
    );
  };

  const handleUpdateOrder = async () => {
    try {
      await updateOrder(orderId, {
        "estado": "listo para despachar"
      });
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      // Aquí podrías agregar alguna notificación de error al usuario
    }
  };

  return (
    <div className="products-verification">
        <LoadingComponent isLoading={loading} />
        <h1>Productos Verificados: {verifiedProducts} de {products.length} </h1>
      {products.map((product) => (
        <div key={product.id} className="product-item">
          <ProductVerificationStatus product={product} verifiedProducts={verifiedProducts} setVerifiedProducts={setVerifiedProducts}/>

          <h3>Codigo del producto: {product.productData.productCode}</h3>
          <h3>Nombre: {product.productData.name}</h3>
          <p>
            Verificados: <span>{product.verified}</span> de {product.stock}
          </p>
            <button 
              onClick={() => handleVerify(product.id)}
              disabled={product.verified >= product.stock}
            >
              Verificar uno manualmente
            </button>
            <button style={{background: 'red'}}
              onClick={() => handleReset(product.id)}
            >
              Empezar de nuevo la verification
            </button>
            <button
              onClick={() => setisSearchByQrEnabled(true)}
              disabled={product.verified >= product.stock}
            >
              Verificar con escaner de barras
            </button>
          
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