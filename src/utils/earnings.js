export function normalizeEmbeddedOrderProducts(products = []) {
  return products.map((product, index) => ({
    id: product.id || product.productId || `embedded-${index}`,
    ...product,
    stock: Number(product.quantity ?? product.stock) || 0,
    productData: product.productSnapshot || product.productData || {},
  }))
}

export async function getOrderProductsForEarnings(order, getProductsByOrder) {
  if (Array.isArray(order.products) && order.products.length > 0) {
    return normalizeEmbeddedOrderProducts(order.products)
  }

  // Legacy orders do not contain the product snapshot in the order document.
  // Only those orders need the additional subcollection read.
  return getProductsByOrder(order.id)
}

export function calculateOrderTotal(products) {
  return products.reduce((total, item) => {
    const price = Number(item.productData?.price) || 0
    return total + ((Number(item.stock) || 0) * price)
  }, 0)
}
