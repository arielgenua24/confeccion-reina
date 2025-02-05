import React, { useState, useMemo } from "react";
import searchProducts from "../../utils/searchFn";
import { useNavigate } from "react-router-dom";
import EditProductBtn from "../EditProduct";
import QRButton from "../QrGenerateBtn";
import { Search, X, Filter, FileX } from "lucide-react";
import './styles.css';

function ProductSearch({ products, setQRcode, isCartEnabled }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const [activeFilters, setActiveFilters] = useState({
    inStock: false,
    lowStock: false
  });

  const filteredProducts = useMemo(() => {
    let result = searchProducts(products, searchTerm);
    
    if (activeFilters.lowStock) {
      result = result.filter(product => product.stock < 10);
    }
    
    return result;
  }, [products, searchTerm, activeFilters]);

  const clearSearch = () => {
    setSearchTerm("");
    setIsFocused(false);
  };

  const toggleFilter = (filterKey) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  return (
    <div className="product-search-container">
      <div className="search-header">
        <div className={`search-wrapper ${isFocused ? 'focused' : ''}`}>
          <Search className="search-icon" size={20} />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !searchTerm && setIsFocused(false)}
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
        <div className="filter-controls">
          {!isCartEnabled && 
          (<button 
            className={`filter-btn ${activeFilters.lowStock ? 'active' : ''}`}
            onClick={() => toggleFilter('lowStock')}
          >
            <Filter size={16} /> Bajo Stock
          </button>)}
          
        </div>
      </div>

      <div className={`results-container ${isFocused ? 'visible' : ''}`}>
        {filteredProducts.length === 0 ? (
          <div className="no-results">
            No se encontraron productos
          </div>
        ) : (
          <ul className="results-list">
            {filteredProducts.map((product) => (
              <li 
                key={product.id} 
                className={`result-item ${product.stock <= 10 ? 'low-stock' : ''}`}
              >
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="search-product-details">
                    <span>Color: {product.color}</span>
                    <span>Talle: {product.size}</span>                    
                    <span>Código: {product.productCode}</span>
                    <span className="product-price">Precio: ${product.price}</span>
                    <span className={`stock-indicator ${product.stock <= 10 ? 'warning' : 'good'}`}>
                      Stock: {product.stock}
                    </span>

                  </div>
                </div>
                <div className="product-actions">
                  {!isCartEnabled && (<> 
                  <EditProductBtn product_id={product.id} />  
                  <QRButton 
                    product={product} 
                    onQRGenerate={() => setQRcode(product)} 
                  /> 
                  </>)}
                  {isCartEnabled && 

                    (<div style={{display: 'flex', flexDirection: 'row'}}>  
                      <button
                        className="search-add-to-cart-button"
                        onClick={() => navigate(`/select-product-amount/${product.id}`)}
                      >
                        AGREGAR AL CARRITO
                      </button> 
                      
                      <button
                      style={{marginTop: '10px', scale:'0.75'}}
                        onClick={() => navigate(`/select-product-amount/${product.id}`)}
                      >
                        MODIFICAR CANTIDAD
                      </button>



                      </div>)
                      
                      }
                 
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ProductSearch;