import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFirestoreContext from "../../hooks/useFirestoreContext";
import  { useOrder }  from "../../hooks/useOrder";

function SelectProducts() {
      const [products, setProducts] = useState([]);
      const [isLoading, setIsLoading] = useState(false);

      const navigate = useNavigate();

      const { getProducts, } = useFirestoreContext();
      const { findItem, } = useOrder();

       useEffect(() => {
          const loadProducts = async () => {
            setIsLoading(true);
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
            setIsLoading(false);
          };
          loadProducts();
        }, []);


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


    return (
        <div className="container">
          <h1 className="TITLE">AGREGUE LOS PRODUCTOS AL CARRITO</h1>
    
          <button onClick={() => {
            navigate('/qrsearch?redirect=select-product');
          }}> BUSCAR POR QR</button>
          
          <section>
            <h2 className="subtitle">TODO TU CATÁLOGO</h2>
            <div className="inventory">
              {products.length === 0 ? (
                <p>No tienes productos, agrega un producto a tu catálogo.</p>
              ) : (
                products.map(product => (
                  <div key={product.id} className="productCard">
                    {console.log(product) }
                    {console.log(product.id)}
    
                    <h3 className="productTitle">{product.name}</h3>
                    <p className="productDetail">{product.productCode}</p>
                    <p className="productDetail">Precio: ${product.price}</p>
                    <p className="productDetail">Stock: {product.stock}</p>
                    <p className="productDetail">Talle: {product.size}</p>
                    <p className="productDetail">Color: {product.color}</p>


                    {
                    findItem(product) ? 
                    ( <button
                        className="edit-in-cart-button"
                        onClick={() => navigate(`/select-product-amount/${product.id}?in-cart=true`)}
                      >
                        MODIFICAR CANTIDAD
                      </button>
                      ):(<button
                        className="add-to-cart-button"
                        onClick={() => navigate(`/select-product-amount/${product.id}`)}
                      >
                        AGREGAR AL CARRITO
                      </button>) }
    
                  </div>
    
    
                ))
              )}
            </div>
          </section>
    
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
}

export default SelectProducts;