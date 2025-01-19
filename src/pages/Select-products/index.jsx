import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFirestoreContext from "../../hooks/useFirestoreContext";

function SelectProducts() {
      const [products, setProducts] = useState([]);
      const navigate = useNavigate();
      const { getProducts, } = useFirestoreContext();

       useEffect(() => {
          const loadProducts = async () => {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
          };
          loadProducts();
        }, []);

    


    return (
        <div className="container">
          <h1 className="TITLE">ELIJA LOS PRODUCTOS</h1>
    
         {/**El problema de este QR search es que si yo voy desde select-products
          * va a llevarme a buscar con el QR y luego a editar un producto, y lo que yo quiero
          * es buscar con el qr para ahora AGREGAR un producto, debo corregir esta logica
          */}
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
                        setQRcode(product)
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
}

export default SelectProducts;