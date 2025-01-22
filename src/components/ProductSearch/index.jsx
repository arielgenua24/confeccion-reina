import { useState, } from "react";
import searchProducts from "../../utils/searchFn";
import EditProductBtn from "../EditProduct";
import QRButton from "../QrGenerateBtn";

// eslint-disable-next-line react/prop-types
function ProductSearch({products, setQRcode}) {
  const [searchTerm, setSearchTerm] = useState("");


  // Cargar productos al inicio
  

  const filteredProducts = searchProducts(products, searchTerm);
  console.log(filteredProducts)

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{
        backgroundColor: "#fff", 
        width: "100%", 
        height: "500px"}}>
        <ul>
            {filteredProducts.map((product) => (
            <li key={product.id}>
                {product.name} - {product.color} - {product.price} -
                {product.productCode}
                <EditProductBtn product_id={product.id} />

                <QRButton 
                    product={product}
                    onQRGenerate={() => setQRcode(product)}
                /> 
            </li>
            ))}
        </ul>
      </div>
     
    </div>
  );
}
export default ProductSearch;