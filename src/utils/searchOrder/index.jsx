function searchOrders(orders, searchTerm = '') {
    if (!searchTerm) return orders;
  
    const term = searchTerm.toLowerCase();
    
    return orders.filter(
      (order) =>
        order.cliente.toLowerCase().includes(term) ||
        order.direccion.toLowerCase().includes(term) ||
        order.estado.toLowerCase().includes(term) ||
        order.orderCode.toLowerCase().includes(term) ||
        order.telefono.toLowerCase().includes(term) ||
        order.fecha.toLowerCase().includes(term)
    );
  }

  export default searchOrders;