import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, X, Package, TrendingUp, Clock, Sparkles } from "lucide-react";
import useProducts from "../../hooks/useProducts";
import { useOrder } from "../../hooks/useOrder";
import ImageModal from "../../components/ImageModal";
import './styles.css';

function SearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [suggestedProducts, setSuggestedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [addedProducts, setAddedProducts] = useState({});
    const inputRef = useRef(null);

    const navigate = useNavigate();
    const { searchProductsByNameOrCode, getProductsPaginated } = useProducts();
    const { addItem } = useOrder();

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentProductSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5));
        }
    }, []);

    // Load suggested products
    useEffect(() => {
        const loadSuggested = async () => {
            try {
                const result = await getProductsPaginated(6, 0);
                setSuggestedProducts(result.products || []);
            } catch (error) {
                console.error("Error loading suggestions:", error);
            }
        };
        loadSuggested();
    }, [getProductsPaginated]);

    // Search with debounce
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

                // Initialize quantities
                const initialQuantities = {};
                results.forEach(product => {
                    if (!quantities[product.id]) {
                        initialQuantities[product.id] = 1;
                    }
                });
                setQuantities(prev => ({ ...prev, ...initialQuantities }));
            } catch (error) {
                console.error("Error searching:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchProductsByNameOrCode]);

    const saveRecentSearch = (term) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentProductSearches', JSON.stringify(updated));
    };

    const clearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
        inputRef.current?.focus();
    };

    const clearAllRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentProductSearches');
    };

    const handleQuantityChange = useCallback((productId, delta, maxStock) => {
        setQuantities(prev => {
            const current = prev[productId] || 1;
            const newQuantity = Math.max(1, Math.min(current + delta, maxStock));
            return { ...prev, [productId]: newQuantity };
        });
    }, []);

    const handleAddToCart = (product) => {
        const quantity = quantities[product.id] || 1;

        console.log('🛒 Adding to cart:', product.name, 'qty:', quantity);

        addItem({
            product: product,
            quantity: quantity,
            selectedVariants: {
                size: product.size || null,
                color: product.color || null
            }
        });

        // Save search term
        if (searchTerm.trim()) {
            const term = searchTerm.trim();
            const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentProductSearches', JSON.stringify(updated));
        }

        // Show added feedback
        setAddedProducts(prev => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
            setAddedProducts(prev => ({ ...prev, [product.id]: false }));
        }, 2000);

        // Reset quantity
        setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleRecentClick = (term) => {
        setSearchTerm(term);
    };

    const displayProducts = searchTerm.trim() ? searchResults : suggestedProducts;
    const sectionTitle = searchTerm.trim()
        ? (isSearching ? "Buscando..." : `${searchResults.length} resultados`)
        : "Productos sugeridos";

    return (
        <div className="search-page">
            {/* Image Modal */}
            <ImageModal
                isOpen={!!selectedImage}
                imageSrc={selectedImage}
                onClose={() => setSelectedImage(null)}
            />

            {/* Header */}
            <div className="search-page-header">
                <button className="search-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <h1 className="search-page-title">¿Qué buscás?</h1>
            </div>

            {/* Search Input */}
            <div className="search-input-container">
                <div className="search-input-wrapper">
                    <Search className="search-input-icon" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-page-input"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="search-clear-btn" onClick={clearSearch}>
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Recent Searches */}
            {!searchTerm && recentSearches.length > 0 && (
                <div className="search-section">
                    <div className="search-section-header">
                        <span className="search-section-title">Búsquedas recientes</span>
                        <button className="search-clear-all" onClick={clearAllRecent}>
                            Borrar
                        </button>
                    </div>
                    <div className="recent-searches-list">
                        {recentSearches.map((term, index) => (
                            <button
                                key={index}
                                className="recent-search-item"
                                onClick={() => handleRecentClick(term)}
                            >
                                <div className="recent-search-icon">
                                    <Clock size={18} />
                                </div>
                                <span className="recent-search-text">{term}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results / Suggestions Section */}
            <div className="search-section">
                <div className="search-section-header">
                    <span className="search-section-title">{sectionTitle}</span>
                    {!searchTerm && (
                        <Sparkles size={16} className="section-icon" />
                    )}
                </div>

                <div className="product-list">
                    {displayProducts.map((product) => {
                        const currentQuantity = quantities[product.id] || 1;
                        const availableStock = Math.max(0, product.stock || 0);
                        const isOutOfStock = availableStock <= 0;
                        const isAdded = addedProducts[product.id];

                        return (
                            <div key={product.id} className="product-list-item">
                                {/* Product Image */}
                                <div
                                    className="product-item-image"
                                    onClick={() => product.imageUrl && setSelectedImage(product.imageUrl)}
                                    style={{ cursor: product.imageUrl ? 'zoom-in' : 'default' }}
                                >
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} />
                                    ) : (
                                        <div className="product-item-placeholder">
                                            <Package size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="product-item-info">
                                    <h3 className="product-item-name">{product.name}</h3>
                                    <p className="product-item-details">
                                        {product.productCode && <span>#{product.productCode}</span>}
                                        {product.color && <span> · {product.color}</span>}
                                        {product.size && <span> · Talle {product.size}</span>}
                                    </p>
                                    <div className="product-item-meta">
                                        <span className="product-item-price">{formatPrice(product.price)}</span>
                                        <span className={`product-item-stock ${availableStock < 10 ? 'low' : ''}`}>
                                            {isOutOfStock ? 'Sin stock' : `${availableStock} disp.`}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="product-item-actions">
                                    {/* Quantity Selector - Bigger and more prominent */}
                                    <div className="quantity-selector-large">
                                        <button
                                            className="qty-btn minus"
                                            onClick={() => handleQuantityChange(product.id, -1, availableStock)}
                                            disabled={currentQuantity <= 1 || isOutOfStock}
                                        >
                                            −
                                        </button>
                                        <span className="qty-value">{currentQuantity}</span>
                                        <button
                                            className="qty-btn plus"
                                            onClick={() => handleQuantityChange(product.id, 1, availableStock)}
                                            disabled={currentQuantity >= availableStock || isOutOfStock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Add Button */}
                                    <button
                                        className={`add-btn-large ${isAdded ? 'added' : ''}`}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isOutOfStock}
                                    >
                                        {isAdded ? '✓ Agregado' : 'Agregar'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {searchTerm && !isSearching && searchResults.length === 0 && (
                        <div className="search-empty">
                            <Package size={48} strokeWidth={1.5} />
                            <p>No encontramos productos para "{searchTerm}"</p>
                            <span>Probá con otro nombre o código</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="search-footer">
                <button className="footer-clear-btn" onClick={() => navigate('/select-products')}>
                    Cancelar
                </button>
                <button
                    className="footer-search-btn"
                    onClick={() => navigate('/cart')}
                >
                    <Package size={18} />
                    Ir al carrito
                </button>
            </div>
        </div>
    );
}

export default SearchPage;
