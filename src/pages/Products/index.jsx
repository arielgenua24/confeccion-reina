import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import './styles.css';

function Product() {
  const { id } = useParams();

  const [product, setProduct] = useState({});
  

  //fetching the product
  const { getProduct } = useFirestoreContext();

  const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price);
     const [stock, setStock] = useState(product.stock);
     const [size, setSize] = useState(product.size);
    const [color, setColor] = useState(product.color);


  useEffect(() => {
      const loadProducts = async () => {
        const fetchedProduct = await getProduct(id);
        console.log(fetchedProduct);
        setProduct(fetchedProduct);

        setName(fetchedProduct.name);
        setPrice(fetchedProduct.price);
        setStock(fetchedProduct.stock);
        setSize(fetchedProduct.size);
        setColor(fetchedProduct.color);
      };
      loadProducts();
    }, [getProduct, id]);

  

    const handleSubmit = (e) => {
      e.preventDefault(); // Prevents the page from reloading
      const updatedProduct = {
        id,
        name,
        price,
        stock,
        size,
        color,
      };
      console.log("Product updated:", updatedProduct);
      // Add code here to save the updated product (e.g., send it to a backend)
    };

  return (
    <div>
      <h1 className="product-title">Producto</h1>
      <form className="product-card" onSubmit={handleSubmit}>
      <div className="product-card">
        <input
          type="text"
          className="product-input"
          placeholder={`Nombre: ${product.name}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="product-input"
          placeholder={`Precio: ${product.price}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="number"
          className="product-input"
          placeholder={`Stock: ${product.stock}`}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <input
          type="text"
          className="product-input"
          placeholder={`Talle: ${product.size}`}
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />
        <input
          type="text"
          className="product-input"
          placeholder={`Color: ${product.color}`}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <button type="submit" className="submit-button">
          Guardar Cambios
        </button>

      </div>


      </form>
      
    </div>
  )
}

export default Product;