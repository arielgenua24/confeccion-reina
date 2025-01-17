import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import ProductFormModal from '../../modals/ProductFormModal';
import QRModal from '../../modals/Qrmodal';
import './styles.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [QRcode, setQRcode] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    size: '',
    color: '',
    stock: ''
  });
  
  const navigate = useNavigate();
  const { getProducts, addProduct, deleteProduct } = useFirestoreContext();

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProduct(newProduct.name, newProduct.price, newProduct.size, newProduct.color, newProduct.stock);
    setIsModalOpen(false);
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
    //reset newProduct state
    setNewProduct({ name: '', price: '', size: '', color: '', stock: '' });
  };


  const modalOverlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };
  
  const modalContentStyles = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  };
  const spinnerStyles = {
    width: '32px',
    height: '32px',
    margin: '16px auto 0',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };
  
  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setIsLoading(true);
        await deleteProduct(productId);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container">
      <h1 className="TITLE">CATÁLOGO</h1>
      
      <section>
        <h2 className="subtitle">TODO TU CATÁLOGO</h2>
        <div className="inventory">
          {products.length === 0 ? (
            <p>No tienes productos, agrega un producto a tu catálogo.</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="productCard">

              <div className='deleteButtonContainer'>
              <button
                  className="deleteButton"
                  style={{backgroundColor: 'red', color: 'white'}}
                  onClick={async () => {
                    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                      try {
                        await handleDelete(product.id);
                        // Opcional: mostrar algún mensaje de éxito
                        window.location.reload(); // O usar alguna función para actualizar la lista
                      } catch (error) {
                        console.error("Error al eliminar el producto:", error);
                        // Opcional: mostrar mensaje de error
                      }
                    }
                  }}
                >
                  ELIMINAR
                </button>
              </div>
               



                <h3 className="productTitle">{product.name}</h3>
                <p className="productDetail">{product.productCode}</p>
                <p className="productDetail">Precio: ${product.price}</p>
                <p className="productDetail">Stock: {product.stock}</p>
                <p className="productDetail">Talle: {product.size}</p>
                <p className="productDetail">Color: {product.color}</p>

                <div className="QR-buttonContainer">
                  <button className="QR-qrButton" onClick={() => {
                    setQRcode(product.productCode)
                    }}>
                    Obtener QR
                  </button>
                </div>



                <button
                    className="navigateButton"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    EDITAR
                  </button>


              </div>


            ))
          )}
        </div>
      </section>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="addButton"
      >
        + Agregar Producto
      </button>

      {isModalOpen && (
        <ProductFormModal handleSubmit={handleSubmit} newProduct={newProduct} setNewProduct={setNewProduct} setIsModalOpen={setIsModalOpen}/>
      )}

      {QRcode && (
        <QRModal 
          QRcode={QRcode}
          setQRcode={setQRcode}

        />
      )}
      {isLoading && (
      <div style={modalOverlayStyles}>
        <div style={modalContentStyles}>
          <p style={{ fontSize: '18px', color: '#333' }}>Aguarde un momento...</p>
          <div style={spinnerStyles}></div>
        </div>
      </div>
    )}

    </div>
  );
};

export default Inventory;