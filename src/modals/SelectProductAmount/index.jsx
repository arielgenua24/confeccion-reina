import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import './styles.css';

function SelectProductAmount({ onClose }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({});
  const [amount, setAmount] = useState(1);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [code, setCode] = useState('');

  const { getProduct } = useFirestoreContext();

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
    console.log('Adding product to cart:', product, 'with amount:', amount);
    // onClose();
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
    </div>
  );
}

export default SelectProductAmount;