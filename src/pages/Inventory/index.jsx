import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import useFirestoreContext from '../../hooks/useFirestoreContext';
import ProductFormModal from '../../modals/ProductFormModal';
import QRModal from '../../modals/Qrmodal';
import ProductSearch from '../../components/ProductSearch';
import EditProductBtn from '../../components/EditProduct';
import QRButton from '../../components/QrGenerateBtn';
import LoadingComponent from '../../components/Loading';
import { auth } from '../../firebaseSetUp';
import qrIcon from '../../assets/icons/icons8-qr-100.png';




import './styles.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [QRcode, setQRcode] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    size: '',
    color: '',
    stock: ''
  });
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const PRODUCTS_PER_PAGE = 10;

  const navigate = useNavigate();
  const { getProducts, addProduct, deleteProduct, user } = useFirestoreContext();
  console.log(user)

  console.log(auth.currentUser?.email);


  const loadInitialProducts = useCallback(async () => {
    if (isLoading) {
       return; 
    }
    setIsLoading(true);
    try {
      const { products: initialProducts, lastVisibleDoc: newLastVisibleDoc } = await getProducts(PRODUCTS_PER_PAGE);
      setProducts(initialProducts);
      setLastVisibleDoc(newLastVisibleDoc);
      setHasMore(initialProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Error cargando productos iniciales:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getProducts, PRODUCTS_PER_PAGE]); 

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore || !lastVisibleDoc) return;
    setIsLoading(true);
    try {
      const { products: newProducts, lastVisibleDoc: newLastVisibleDoc } = await getProducts(PRODUCTS_PER_PAGE, lastVisibleDoc);
      setProducts(prevProducts => [...prevProducts, ...newProducts]);
      setLastVisibleDoc(newLastVisibleDoc);
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Error cargando más productos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getProducts, isLoading, hasMore, lastVisibleDoc]);

  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]); 

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await addProduct(newProduct.name, newProduct.price, newProduct.size, newProduct.color, newProduct.stock);
      setIsModalOpen(false);
      setNewProduct({ name: '', price: '', size: '', color: '', stock: '' });
      await loadInitialProducts();
    } catch (error) {
      console.error("Error al agregar producto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        setIsLoading(true);
        await deleteProduct(productId);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

 

  return (
    <div className="container">
      <h1 className="TITLE">CATÁLOGO</h1>

      <button 
        style={{
          backgroundColor: '#F1F7FF',
          border: '1px solid #0990FF',
          borderRadius: '20px',
          color: '#0990FF',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '10px 15px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      onClick={() => {
        navigate('/qrsearch?redirect=product_data');
      }}> BUSCAR POR QR 
        <img src={qrIcon} alt="Qr icon" style={{
                        width: '30px',
                        height: '30px',
                      }} />
      </button>
      
      <ProductSearch products={products} setQRcode={setQRcode}/>

      <section>
        <h2 className="subtitle">TODO TU CATÁLOGO</h2>
        <div className="inventory">
          {isLoading && products.length === 0 && <LoadingComponent isLoading={true} />}
          {!isLoading && products.length === 0 && (
            <p>No tienes productos, agrega un producto a tu catálogo.</p>
          )}
          {products.map(product => (
            <div key={product.id} className="productCard">

              <div className='deleteButtonContainer'>
                <button
                    className="deleteButton"
                    style={{backgroundColor: 'red', color: 'white'}}
                    onClick={() => handleDelete(product.id)}
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


                <QRButton 
                    product={product}
                    onQRGenerate={() => setQRcode(product)}
                  />


                <EditProductBtn product_id={product.id}/>

              </div>
          ))}
        </div>

        {isLoading && products.length > 0 && <LoadingComponent isLoading={true} />}
        {!isLoading && hasMore && (
          <button onClick={loadMoreProducts} className="loadMoreButton">
            Cargar más productos
          </button>
        )}
        {!isLoading && !hasMore && products.length > 0 && (
            <p style={{ textAlign: 'center', margin: '20px' }}>No hay más productos para mostrar.</p>
         )}

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