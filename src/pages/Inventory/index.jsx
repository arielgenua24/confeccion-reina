import { useState, useEffect } from 'react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import './styles.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    size: '',
    color: '',
    stock: ''
  });
  
  const { getProducts, addProduct } = useFirestoreContext();

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    };
    loadProducts();
  }, [getProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProduct(newProduct.name, newProduct.price, newProduct.size, newProduct.color, newProduct.stock);
    setIsModalOpen(false);
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
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
                <p className="productDetail">Precio: ${product.price}</p>
                <p className="productDetail">Stock: {product.stock}</p>
                <p className="productDetail">Talle: {product.size}</p>
                <p className="productDetail">Color: {product.color}</p>
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
        <div className="modal">
          <form onSubmit={handleSubmit} className="modalContent">
            <h3 className="subtitle">Nuevo Producto</h3>
            
            {['name', 'price', 'size', 'color', 'stock'].map(field => (
              <div key={field} className="formGroup">
                <label className="label">
                  {field === 'name' ? 'Nombre del producto' : field}
                </label>
                <input
                  type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                  value={newProduct[field]}
                  onChange={(e) => setNewProduct({
                    ...newProduct,
                    [field]: e.target.value
                  })}
                  className="input"
                  required
                />
              </div>
            ))}

            <div className="buttonGroup">
              <button type="submit" className="button">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="button"
              >
                Salir
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Inventory;