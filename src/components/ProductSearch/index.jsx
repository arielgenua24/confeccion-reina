import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import EditProductBtn from "../EditProduct";
import QRButton from "../QrGenerateBtn";
import { Search, X, FileX, Loader2 } from "lucide-react";
import useFirestoreContext from "../../hooks/useFirestoreContext";
import './styles.css';

function ProductSearch({ setQRcode, isCartEnabled }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { searchProductsByNameOrCode } = useFirestoreContext();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const results = await searchProductsByNameOrCode(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error("Error en la búsqueda de productos:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);

  }, [searchTerm, searchProductsByNameOrCode]);

  const clearSearch = () => {
    setSearchTerm("");
    setIsFocused(false);
    setSearchResults([]);
  };

  return (
    <div className="product-search-container">
      <div className="product-search-header">
        <div className={`search-wrapper ${isFocused ? 'focused' : ''}`}>
          <Search className="search-icon" size={20} />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => { if (!searchTerm) setIsFocused(false); }, 150)}
          />
          {searchTerm && (
            <button 
              className="clear-search-btn" 
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className={`results-container ${(isFocused && searchTerm) ? 'visible' : ''}`}>
        {isSearching ? (
          <div className="searching-indicator">
            <Loader2 className="animate-spin" size={24} /> Buscando...
          </div>
        ) : searchResults.length === 0 && searchTerm ? (
          <div className="no-results">
            <FileX size={20} /> {`No se encontraron productos para "${searchTerm}"`}
          </div>
        ) : (
          <ul className="results-list">
            {searchResults.map((product) => (
              <li
                key={product.id}
                onMouseDown={(e) => e.preventDefault()}
                className={`result-item ${product.stock <= 10 ? 'low-stock' : ''}`}
              >
                <div className="product-info-actions-container">

                  {/* Product Image Thumbnail */}
                  {product.imageUrl && (
                    <div className="search-product-image-container">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="search-product-image"
                      />
                    </div>
                  )}

                  <div className="product-info-content">
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                    </div>

                    <div className="search-product-details">
                    <span>Color: {product.color}</span>
                    <span>Talle: {product.size}</span>
                    <span>Código: {product.productCode}</span>
                    <span className="product-price">Precio: ${product.price}</span>
                    <span className={`stock-indicator ${product.stock <= 10 ? 'warning' : 'good'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>

                    <div className="product-actions">
                      {!isCartEnabled && (<>
                        <EditProductBtn product_id={product.id} />
                        <QRButton
                          product={product}
                          onQRGenerate={() => setQRcode(product)}
                        />
                      </>)}
                      {isCartEnabled && (
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                          <button
                            className="search-add-to-cart-button"
                            onClick={() => navigate(`/select-product-amount/${product.id}`)}
                          >
                            AGREGAR AL CARRITO
                          </button>
                          {/*<button
                            style={{marginTop: '10px', scale:'0.75'}}
                            onClick={() => navigate(`/select-product-amount/${product.id}?in-cart=true`)}
                          >
                            MODIFICAR CANTIDAD
                          </button> */}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

ProductSearch.propTypes = {
  setQRcode: PropTypes.func.isRequired,
  isCartEnabled: PropTypes.bool
};

ProductSearch.defaultProps = {
  isCartEnabled: false
};

export default ProductSearch;