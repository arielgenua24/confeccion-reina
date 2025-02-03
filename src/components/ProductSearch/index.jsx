import React, { useState, useMemo } from "react";
import searchProducts from "../../utils/searchFn";
import EditProductBtn from "../EditProduct";
import QRButton from "../QrGenerateBtn";
import { Search, X, Filter } from "lucide-react";
import './styles.css';

function ProductSearch({ products, setQRcode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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
          <button 
            className={`filter-btn ${activeFilters.lowStock ? 'active' : ''}`}
            onClick={() => toggleFilter('lowStock')}
          >
            <Filter size={16} /> Buscar bajo Stock
          </button>
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
                <div className={`product-info ${product.stock <= 10 ? 'warning' : ''}`}>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-details">
                    <span>{product.color}</span>
                    <span>Código: {product.productCode}</span>
                    <span className="product-price">${product.price}</span>
                    <span className={`stock-indicator ${product.stock <= 10 ? 'warning' : 'good'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
                <div className="product-actions">
                  <EditProductBtn product_id={product.id} />  
                  <QRButton 
                    product={product} 
                    onQRGenerate={() => setQRcode(product)} 
                  /> 
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