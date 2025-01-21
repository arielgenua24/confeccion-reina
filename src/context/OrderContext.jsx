import  { createContext, useEffect, useState} from 'react';

const OrderContext = createContext();

// eslint-disable-next-line react/prop-types
const OrderProvider = ({ children }) => {

  const [nullCart, setNullCart] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart-r-v1.1');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  function findItem(item) {
    const foundIndex = cart.findIndex((cartItem) => {
      /*console.group('findItem')
        console.log(cartItem)
        console.log(item.id)
      console.groupEnd()*/
      return cartItem?.item?.id === item?.id
      
    });
    if (foundIndex !== -1) {
      console.log(item)
      item = cart[foundIndex]
      return { item, index: foundIndex };
    }
    return null;
  }


    function addItem(item, quantity) {
      if (!findItem(item)) {
        console.log('añadiendo items al carrito en el localStorage')
        console.log(item)
        setCart((prevState) => [...prevState, {item, quantity }]); //asi se vera el array
        localStorage.setItem('cart-r-v1.1', JSON.stringify([...cart, {item, quantity}]))
      } else {
        console.log('el producto ya se encuentra agregado')
      }
    }

    function updateQuantity(item, quantity) {
      console.log('ejecutando la funcion updateQuantity')
      console.log(item)
      //console.log(item, newQuantity) //hasta aca yo se que me llego el item, y la cantidad
  
      const foundItem = findItem(item);
      console.log('oldCart')
      console.log(foundItem)
      if (foundItem) {
        const newCart = [...cart];
        const updatedItem = {
          item,  // Incrementa la cantidad
          quantity,
        };
        newCart[foundItem.index] = updatedItem; //esto funciona, pero primero se inicializan y luego se hace el console.log
        setCart(newCart); 
        console.log(newCart)
        console.log(cart)
  
  
        localStorage.setItem('cart-r-v1.1', JSON.stringify(newCart))
        console.log(JSON.parse(localStorage.getItem('cart-r-v1.1')))
        console.log('primero me imprimo yo, newCart sin actualizar')
        console.log(newCart)
      }
    }

    function finditems() {
      let parsedItems = JSON.parse(localStorage.getItem('cart-r-v1.1'))
      return parsedItems
    }

    function deleteItem(item) {
      const foundItem = findItem(item);
      if(foundItem) {
        console.log('delete item', item)
        const newCart = [...cart];
        newCart.splice(foundItem.index, 1)
        localStorage.setItem('cart-r-v1.1', JSON.stringify(newCart))
        setCart(newCart); 
      }
    }


    const [order, setOrder] = useState({
      customerName: '',
      phone: '',
      address: '',
      products: cart,
    });    

    useEffect(() => {
      setOrder((prevState) => ({
        ...prevState, // Propaga las propiedades existentes de `order`
        products: cart, // Actualiza la propiedad `products` con el nuevo valor de `cart`
      }));
    }, [cart]);





    function clearCustomerData() {
      localStorage.removeItem('customer-reina-v1.2');
    }

    function getCustomerData() {
      return JSON.parse(localStorage.getItem('customer-reina-v1.2'));
    }

    useEffect(() => {
      function addCustomerData() {
        localStorage.setItem('customer-reina-v1.2', JSON.stringify(order));
      }
      addCustomerData()
      console.log(getCustomerData())
    }, [order]);

    useEffect(() => {
      function addCustomerData() {
        localStorage.setItem('customer-reina-v1.2', JSON.stringify(order));
      }
      addCustomerData()
      console.log(getCustomerData())
    }, [order]);

    
    

  return (
    <OrderContext.Provider value={{ order, setCart, setNullCart, setOrder, addItem, updateQuantity, deleteItem, findItem, finditems, cart, clearCustomerData, getCustomerData }}>
      {children}
    </OrderContext.Provider>
  );
};

export { OrderContext, OrderProvider };
