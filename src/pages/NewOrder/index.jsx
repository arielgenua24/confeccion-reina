import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';

const NewOrder = () => {
  const { order, setOrder } = useOrder();
  const [customerData, setCustomerData] = useState({
    customerName: order.customerName || '',
    phone: order.phone || '',
    address: order.address || '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setOrder({ ...order, ...customerData }); // Guardar datos en el contexto
    navigate('/select-products'); // Navegar a la siguiente ventana
  };

  return (
    <div>
      <h2>Nuevo Pedido</h2>
      <input
        type="text"
        name="customerName"
        placeholder="Nombre del cliente"
        value={customerData.customerName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="phone"
        placeholder="Teléfono"
        value={customerData.phone}
        onChange={handleChange}
      />
      <input
        type="text"
        name="address"
        placeholder="Dirección"
        value={customerData.address}
        onChange={handleChange}
      />
      <button onClick={handleNext}>Siguiente</button>
    </div>
  );
};

export default NewOrder;
