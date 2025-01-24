import React from 'react';
import useFirestore from '../hooks/useFirestore';


// Crear el contexto del carrito
const FirestoreContext = React.createContext();


// eslint-disable-next-line react/prop-types
function FirestoreProvider({children}) {
    const { 
        getOrders,
        createOrderWithProducts,
        addProduct,
        getProducts,
        getProduct,
        incrementProductCode,
        incrementOrdersCode,
        updateProduct,
        deleteProduct,
        getOrderById,
        products
        } = useFirestore();


    try {
    return (
        < FirestoreContext.Provider 
            value={{
                getOrders,
                createOrderWithProducts,
                addProduct,
                getProducts,
                getProduct,
                incrementProductCode,
                incrementOrdersCode,
                updateProduct,
                getOrderById,
                deleteProduct,
                products,
                }}>
                {children}
         </FirestoreContext.Provider>
    )
    }catch(e){
        console.error(e)
        return <div>Error en el carrito</div>;
       
    }
    
}
export { FirestoreContext, FirestoreProvider }