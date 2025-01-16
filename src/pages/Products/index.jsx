import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import './styles.css';

function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [changes, setChanges] = useState(null);

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

    const handleInputChange = (setter) => (e) => {
      setter(e.target.value); // Actualiza el valor del campo
      setChanges(true);       // Marca que hay cambios pendientes
    };
  

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
      navigate('/inventory')
    };

  return (
    <div>
      <h1 className="product-title">Producto</h1>
      <form className="product-card" onSubmit={handleSubmit}>
      <div className="product-card">
        <div className="input-group">
          <span>Nombre</span>
          <input
            type="text"
            className="product-input"
            placeholder={`Nombre: ${product.name}`}
            value={name}
            onChange={handleInputChange(setName)}
          />
        </div>
      <div className="input-group">
        <span>Precio</span>
        <input
          type="number"
          className="product-input"
          placeholder={`Precio: ${product.price}`}
          value={price}
          onChange={handleInputChange(setPrice)}
        />
      </div>
      <div className="input-group">
        <span>Cantidad total en stock</span>
        <input
          type="number"
          className="product-input"
          placeholder={`Stock: ${product.stock}`}
          value={stock}
          onChange={handleInputChange(setStock)}
        />
      </div>
      <div className="input-group">
        <span>Talle</span>
        <input
          type="text"
          className="product-input"
          placeholder={`Talle: ${product.size}`}
          value={size}
          onChange={handleInputChange(setSize)}
        />
      </div>
      <div className="input-group">
        <span>Color</span>
        <input
          type="text"
          className="product-input"
          placeholder={`Color: ${product.color}`}
          value={color}
          onChange={handleInputChange(setColor)}
        />
      </div>

      {changes ? (
        <button type="submit" className="submit-button">
          Guardar Cambios
        </button>
      ) : (
        <button className="go-back" onClick={() => navigate('/inventory')}>
          Volver al Inventario
        </button>
      )}
       

      </div>


      </form>
      
    </div>
  )
}

export default Product;