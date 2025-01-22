function searchProducts(products, searchTerm = undefined) {
  // Si searchTerm es undefined o null, retornamos todos los productos
  if (searchTerm === '') {
    return [];
  }

    console.log(searchTerm == '')
    const term = searchTerm.toLowerCase();
  
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.color.toLowerCase().includes(term) ||
        product.size.toLowerCase().includes(term) ||
        product.productCode.toLowerCase().includes(term)
    );
  }
  
  // Ejemplo de uso:
  //const products = useProducts();
  //const filteredProducts = searchProducts(products, "rojo");
  //console.log(filteredProducts);

export default searchProducts;