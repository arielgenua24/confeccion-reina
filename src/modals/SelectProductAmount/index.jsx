import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import { useOrder } from '../../hooks/useOrder';
import './styles.css';

function SelectProductAmount({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate();

 // Accede a los parámetros de búsqueda
 const [searchParams] = useSearchParams();

  const [product, setProduct] = useState({});
  const [amount, setAmount] = useState(1);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [code, setCode] = useState('');

  const { getProduct } = useFirestoreContext();
  const {order, setOrder, addItem, updateQuantity, deleteItem, findItem} = useOrder();


  const isInCart = searchParams.get('in-cart') === 'true';
  console.log('isInCart:', isInCart);


  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProduct = await getProduct(id);
      setProduct(fetchedProduct);
      setName(fetchedProduct.name);
      setPrice(fetchedProduct.price);
      setStock(fetchedProduct.stock);
      setSize(fetchedProduct.size);
      setColor(fetchedProduct.color);
      setCode(fetchedProduct.productCode);
    };
    loadProducts();

  }, [getProduct, id]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleAddToCart = () => {
    console.log(isInCart);
    console.log(findItem(product));
    if(isInCart) {
      console.log('Updating product in cart:', product, 'with amount:', amount);
      console.log('llamado a updateQuantity');
      updateQuantity(product, amount);
      navigate('/select-products');
      return;
    }

    console.log('Adding product to cart:', product, 'with amount:', amount);
    addItem(product, amount);
    // NO OLVIDES QUE TENES QUE RESTAR EN LA BASE DE DATOS LOS PRODUCTOS AGREGADOS AL CARRITO
    navigate('/select-products');
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteItem(product); // Llama a la función para eliminar el producto
      navigate('/select-products'); // Navega a la ruta especificada
    }
  };


  return (
    <div className="productAmountContainer">
      <h1 className="productAmountContainer-name">{name}</h1>
      <h2 className="productAmountContainer-code">Código: {code}</h2>

      <div className="productAmountContainer-details-grid">
        <span className="productAmountContainer-detail-item">Precio: ${price}</span>
        <span className="productAmountContainer-detail-item">Color: {color}</span>
        <span className="productAmountContainer-detail-item">Talle: {size}</span>
      </div>

      <div className="amount-container">
        <div className="amount-input-wrapper">
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            className="amount-input"
            placeholder="CANTIDAD"
            min="1"
          />
          <span className="units-label">UNIDADES</span>
        </div>
      </div>

      <div className="summary-container">
        <div className="summary-header">
          {name} - ${price}
        </div>
        <div className="total-price">
          PRECIO TOTAL = ${(amount * price).toFixed(2)}
        </div>
      </div>

      <button className="add-to-cart-button" onClick={handleAddToCart}>
        Agregar al pedido
      </button>

      <button
      className="delete-from-cart-button"
      onClick={handleDelete}
      style={{
        backgroundColor: "red",
        color: "#fff",
        borderRadius: "20px",
        border: "none",
        padding: "10px 20px",
        cursor: "pointer",
      }}
    >
      Eliminar del pedido
    </button>
    </div>
  );
}

export default SelectProductAmount;