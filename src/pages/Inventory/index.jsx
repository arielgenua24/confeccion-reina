import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import ProductFormModal from '../../modals/ProductFormModal';
import QRModal from '../../modals/Qrmodal';
import './styles.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [QRcode, setQRcode] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    size: '',
    color: '',
    stock: ''
  });
  
  const navigate = useNavigate();


  const { getProducts, addProduct } = useFirestoreContext();

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

    </div>
  );
};

export default Inventory;