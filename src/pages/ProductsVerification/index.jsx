import { useState, useEffect } from 'react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from '../../components/Loading';
import { useParams } from 'react-router-dom';

import './styles.css';

const ProductVerification = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId && product.verified < product.stock) {
          return { ...product, verified: product.verified + 1 };
        }
        return product;
      })
    );
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
            onClick={() => handleReset(product.id)}
            disabled={product.verified >= product.stock}
          >
            Verificar con escaner de barras
          </button>
        </div>
      ))}
    </div>
  );
};

export default ProductVerification;