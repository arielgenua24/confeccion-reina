import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import './styles.css';

function Product() {
  const { id } = useParams();

  const [product, setProduct] = useState({});

  const { getProduct } = useFirestoreContext();
  useEffect(() => {
      const loadProducts = async () => {
        const fetchedProduct = await getProduct(id);
        setProduct(fetchedProduct);
      };
      loadProducts();
    }, [getProduct, id]);
  


  const productIdInt = parseInt(id, 10);
  console.log(productIdInt);

  return (
    <div className="product-container">
      <h1 className="product-title">Producto</h1>
      <div className="product-card">
        <h3 className="product-name">Nombre {product.name}</h3>
        <p className="product-detail">Precio: ${product.price}</p>
        <p className="product-detail">Stock: {product.stock}</p>
        <p className="product-detail">Talle: {product.size}</p>
        <p className="product-detail">Color: {product.color}</p>
      </div>
    </div>
  )
}

export default Product;