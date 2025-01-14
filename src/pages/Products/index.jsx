import { useParams } from "react-router-dom";

function Product() {
  const { id } = useParams();
  const productIdInt = parseInt(id, 10);
  console.log(productIdInt);

  return <div>Product {id}</div>;
}

export default Product;