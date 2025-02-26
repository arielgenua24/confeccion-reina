import { useState, useEffect } from 'react';
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
import { set } from 'date-fns';

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
  
  const navigate = useNavigate();
  const { getProducts, addProduct, deleteProduct, user } = useFirestoreContext();
  console.log(user)

  console.log(auth.currentUser?.email);


  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setIsLoading(false)
    };
    loadProducts();
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await addProduct(newProduct.name, newProduct.price, newProduct.size, newProduct.color, newProduct.stock);
    setIsModalOpen(false);
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
    //reset newProduct state
    setNewProduct({ name: '', price: '', size: '', color: '', stock: '' });
    setIsLoading(false);
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


                <QRButton 
                    product={product}
                    onQRGenerate={() => setQRcode(product)}
                  />


                <EditProductBtn product_id={product.id}/>

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
     <LoadingComponent isLoading={isLoading}/>

    </div>
  );
};

export default Inventory;