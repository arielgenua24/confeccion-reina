import  { createContext, useEffect, useState} from 'react';

const OrderContext = createContext();

// eslint-disable-next-line react/prop-types
const OrderProvider = ({ children }) => {

  const [nullCart, setNullCart] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart-r-v1.1');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  function findItem(cartItemOrProduct) {
    const foundIndex = cart.findIndex((cartItem) => {
      // Handle both old format (direct product) and new format (cart item with product)
      const searchId = cartItemOrProduct?.product?.id || cartItemOrProduct?.id;
      const cartId = cartItem?.product?.id || cartItem?.item?.id;
      
      return cartId === searchId;
    });
    if (foundIndex !== -1) {
      console.log('Found item:', cart[foundIndex])
      return { item: cart[foundIndex], index: foundIndex };
    }
    return null;
  }


    function addItem(cartItem, quantity) {
      // Handle both old format and new format
      let newCartItem;
      if (cartItem?.product) {
        // New format: cart item with product and variants
        newCartItem = cartItem;
      } else {
        // Old format: direct product - convert to new format
        newCartItem = {
          product: cartItem,
          quantity: quantity,
          selectedVariants: { size: null, color: null }
        };
      }
      
      if (!findItem(newCartItem)) {
        console.log('añadiendo items al carrito en el localStorage')
        console.log(newCartItem)
        setCart((prevState) => [...prevState, newCartItem]);
        localStorage.setItem('cart-r-v1.1', JSON.stringify([...cart, newCartItem]))
      } else {
        console.log('el producto ya se encuentra agregado')
      }
    }

    function updateQuantity(cartItem, quantity) {
      console.log('ejecutando la funcion updateQuantity')
      console.log(cartItem)
      
      const foundItem = findItem(cartItem);
      console.log('oldCart')
      console.log(foundItem)
      if (foundItem) {
        const newCart = [...cart];
        let updatedItem;
        
        if (cartItem?.product) {
          // New format: update with variants
          updatedItem = {
            product: cartItem.product,
            quantity: quantity,
            selectedVariants: cartItem.selectedVariants
          };
        } else {
          // Old format: maintain backward compatibility
          updatedItem = {
            item: cartItem,
            quantity: quantity,
          };
        }
        
        newCart[foundItem.index] = updatedItem;
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

    function deleteItem(cartItemOrProduct) {
      const foundItem = findItem(cartItemOrProduct);
      if(foundItem) {
        console.log('delete item', cartItemOrProduct)
        const newCart = [...cart];
        newCart.splice(foundItem.index, 1)
        localStorage.setItem('cart-r-v1.1', JSON.stringify(newCart))
        setCart(newCart); 
      }
    }

    function clearCartData(){
      localStorage.removeItem('cart-r-v1.1');
    }


    const getInitialOrder = () => {
      const savedOrder = localStorage.getItem('customer-reina-v1.2');
      return savedOrder ? JSON.parse(savedOrder) : {
        customerName: '',
        phone: '',
        address: '',
        products: cart,
      };
    };
    
    // Luego, usa esta función en el useState
    const [order, setOrder] = useState(getInitialOrder());  

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


    function resetOrderValues(){
      clearCustomerData();
      clearCartData();
      setCart([])
      setOrder({
        customerName: '',
        phone: '',
        address: '',
        products: [],
      })
    }

    useEffect(() => {
      function addCustomerData() {
        localStorage.setItem('customer-reina-v1.2', JSON.stringify(order));
      }
      addCustomerData()
      console.log(getCustomerData())
    }, [order]);

    const [ordersState, setOrdersState] = useState([])

  return (
    <OrderContext.Provider value={{ order, setCart, resetOrderValues,setNullCart, setOrder, addItem, updateQuantity, deleteItem, findItem, finditems, cart, clearCustomerData, getCustomerData, setOrdersState, ordersState }}>
      {children}
    </OrderContext.Provider>
  );
};

export { OrderContext, OrderProvider };
