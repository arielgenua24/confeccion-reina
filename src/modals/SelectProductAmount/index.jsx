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

  const [error, setError ] = useState(false)

  const { getProduct } = useFirestoreContext();
  const {order, setOrder, addItem, updateQuantity, deleteItem, findItem} = useOrder();


  const isInCart = searchParams.get('in-cart') === 'true';
  console.log('isInCart:', isInCart);


  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProduct = await getProduct(id);
      console.log('fetchedProduct:', fetchedProduct);
      if(fetchedProduct === undefined) {
        alert('Producto no encontrado, te redirigiremos a que continues con la orden');
        navigate('/select-products')
      }
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
    console.log(typeof stock) // 10000
    console.log(typeof amount) // 88

    console.log(stock < amount) //me dice que no puedo porque 10000 < 88

    const stockNumber = Number(stock)
    const amountNumber = Number(amount)

    if(stockNumber < amountNumber) {
      console.log('errrorrr')
      setError(true)
      return (
        <h1>
            error, no hay suficiente stock
        </h1>
        )
    }

    if(isInCart) {
      console.log('Updating product in cart:', product, 'with amount:', amountNumber);
      console.log('llamado a updateQuantity');
      updateQuantity(product, amountNumber);
      navigate('/select-products');
      return;
    }
    console.log(stock, amount)

  

    console.log('Adding product to cart:', product, 'with amount:', amount);
    addItem(product, amountNumber);
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
        <span className="productAmountContainer-detail-item">En inventario: {stock} unidades</span>
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

    {error && (
  <div style={{
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    color: "#1d1d1f",
    borderRadius: "16px",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    padding: "24px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    height: '90%',
    maxWidth: '50%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center'
  }}>
    <h1 style={{
      fontSize: 'clamp(20px, 4vw, 24px)',
      fontWeight: '600',
      margin: '0',
      color: '#ff3b30'
    }}>
      Stock Insuficiente
    </h1>
    <div style={{
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <span style={{ 
        fontSize: 'clamp(16px, 3vw, 18px)',
        lineHeight: '1.5'
      }}>
        Has intentado agregar {amount} {name}, pero solo tienes {stock} en stock
      </span>
      <span style={{
        fontSize: 'clamp(14px, 2.5vw, 16px)',
        color: '#86868b'
      }}>
        Por favor revisa tu inventario o informa al cliente sobre la disponibilidad
      </span>
    </div>
    
    <button 
      style={{
        minWidth: '120px',
        padding: '12px 24px',
        backgroundColor: '#0071e3',
        color: '#fff',
        fontWeight: '500',
        border: 'none',
        borderRadius: '12px',
        fontSize: 'clamp(16px, 3vw, 18px)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '12px'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#0077ED'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#0071e3'}
      onClick={() => setError(false)}
    >
      Entendido
    </button>
  </div>
)}


    </div>
  );
}

export default SelectProductAmount;