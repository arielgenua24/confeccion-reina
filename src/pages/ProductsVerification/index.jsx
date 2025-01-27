import { useState, useEffect } from 'react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from '../../components/Loading';
import { useParams } from 'react-router-dom';
import QrVerifyProduct from '../../components/QrVerifyProduct';

import './styles.css';

const ProductVerification = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchByQrEnabled, setisSearchByQrEnabled] = useState(false);
  const { orderId } = useParams();

  const {  getOrderById, getProductsByOrder } = useFirestoreContext();

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


  return (
    <div className="products-verification">
        <LoadingComponent isLoading={loading} />

      {products.map((product) => (
        <div key={product.id} className="product-item">

          <h3>Codigo del producto: {product.productData.productCode}</h3>
          <h3>Nombre: {product.productData.name}</h3>
          <p>
            Verificados: <span>{product.verified}</span> of {product.stock}
          </p>
            <button 
              onClick={() => handleVerify(product.id)}
              disabled={product.verified >= product.stock}
            >
              Verificar uno manualmente
            </button>
            <button style={{background: 'red'}}
              onClick={() => handleReset(product.id)}
              disabled={product.verified >= product.stock}
            >
              Empezar de nuevo la verification
            </button>
            <button style={{background: '#133E87'}}
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
      

    </div>
  );
};

export default ProductVerification;