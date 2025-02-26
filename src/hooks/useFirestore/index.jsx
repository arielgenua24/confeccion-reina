import { useState } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { db } from "../../firebaseSetUp";

 // Importa la configuración de Firebase
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  increment,
  updateDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";


const useFirestore = () => {
  const [products, setProducts] = useState([]);

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'yyyy-MM-dd HH:mm:ss', { locale: es });

  const getAdmin = async() => {
    try{
      const coleccionRef = collection(db, "users");
      const querySnapshot = await getDocs(coleccionRef);
      if (!querySnapshot.empty) {
        // 3. Obtiene el primer (y único) documento de la colección
        const document = querySnapshot.docs[0];
  
        // 4. Obtiene los datos del documento
        const data = document.data();
  
        return data.admin; // Devuelve los datos para usarlos en tu aplicación
      } else {
        console.log("No se encontró ningún documento en la colección.");
        return undefined; // O algún otro valor por defecto si la colección está vacía
      }
    } catch (error) {
      console.error("Error al obtener el documento:", error);
      throw error
    }
   

  }

  //OKAY, producto agregado
  const addProduct = async (name, price, size, color, stock) => {
    try {
        //obtenemos el codigo de el producto
    const productCode = await incrementProductCode();  
    console.log(productCode);
      const docRef = await addDoc(collection(db, "products"), {
        productCode,
        name,
        price,
        size,
        color,
        stock,
        updatedAt: formattedDate,
      });
      console.log("Producto agregado con ID: ", docRef.id);
      const productId = docRef.id;
      return productId;
    } catch (e) {
      console.error("Error agregando producto: ", e);
    }
  };

  // Obtener todos los products
  const getProducts = async () => {
    try {
      const productsSnapshot = await getDocs(collection(db, "products"));
      const products = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(products);
      return products;
    } catch (error) {
      console.error("Error al obtener products:", error);
      throw error;
    }
  };

  // Obtener un producto por ID
  const getProduct = async (productId) => {
    console.log(productId);
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      console.log(productSnap.data());
      if (productSnap.data() !== undefined) {
        return {productRef, id: productSnap.id, ...productSnap.data() };
      } else {
        return undefined;      }
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      throw error;
    }
  };


  const updateProduct = async (productId, values) => {
    const { productRef } = await getProduct(productId);
    console.log(productRef);

    return updateDoc(productRef, {
     ...values,
    updatedAt: formattedDate,
    });
  }

  const deleteProduct = async (productId) => {
    try {
      const { productRef } = await getProduct(productId);
      await deleteDoc(productRef);
      return true; // Para indicar que la eliminación fue exitosa
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      throw error; // Propaga el error para manejarlo en el componente
    }
  };
  


//Ejecutaremos esta funcion una vez el usuario llego a la instacia final de la orden
  
    // Obtener todos los orders
    const getOrders = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return orders;
      } catch (error) {
        console.error("Error al obtener orders:", error);
        throw error;
      }
    };

    const filterOrdersByDate = async() => {
      const orders = await getOrders();
      // Ordenar el array
      const filteredOrders = orders.sort((a, b) => {
        // Ejemplo: "24/01/2025, 18:19"
        // Ejemplo: "25/01/2025, 19:20"
    
        // Función para convertir la fecha al formato correcto
        function parseCustomDate(dateString) {
            const [datePart, timePart] = dateString.split(', ');
            const [day, month, year] = datePart.split('/');
            const formattedDate = `${year}-${month}-${day}`;
            return new Date(`${formattedDate}T${timePart}`);
        }
    
        // Convertir las fechas a objetos Date válidos
        const dateA = parseCustomDate(a.fecha);
        const dateB = parseCustomDate(b.fecha);
    
        // Debería mostrar una fecha válida
        // Debería mostrar una fecha válida
    
        // Ordenar de más reciente a más antiguo
        return dateB - dateA;
    });
      console.log(filteredOrders)
      return filteredOrders;
    }

    const deleteOrder = async (orderId) => {
      try {
        const orderDocRef = doc(db, "orders", orderId);
        await deleteDoc(orderDocRef);
        console.log("Order deleted successfully");
        return true; // Indica que la eliminación fue exitosa
      } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
      }
    };

    const updateOrder = async (orderId, updateData) => {
      try {
        const orderDocRef = doc(db, "orders", orderId);
        await updateDoc(orderDocRef, 
          updateData,
        );
        console.log("Order updated successfully");
        return true; // Indica que la actualización fue exitosa
      } catch (error) {
        console.error("Error updating order:", error);
        throw error;
      }
    };


    const getOrderById = async (orderId) => {
      console.log(orderId)
      try {
        const orderDocRef = doc(db, "orders", orderId);
        const orderSnapshot = await getDoc(orderDocRef);
        
        if (orderSnapshot.exists()) {
          return { id: orderSnapshot.id, ...orderSnapshot.data() };
        } else {
          console.error("No such order exists");
          return null;
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
    };

    const getProductsByOrder = async (orderId) => {
      try {
          // Obtener subcolección de productos
          const productsSnapshot = await getDocs(collection(db, "orders", orderId, "products"));
  
          // Mapear los productos sin volver a consultar el inventario
          const products = productsSnapshot.docs.map((productDoc) => {
              const productData = productDoc.data();
              
              return {
                  id: productDoc.id,
                  ...productData,
                  productData: productData.productSnapshot, // Usamos el snapshot en vez de consultar Firestore
              };
          });
  
          return products;
      } catch (error) {
          console.error("Error fetching order products: ", error);
          throw error;
      }
  };
  



  // Incrementar el código del producto (ej: #001, #002)
  const incrementProductCode = async () => {
    try {
      const codeRef = doc(db, "counters", "productCode");
      const codeSnap = await getDoc(codeRef);
      console.log(codeSnap);
      if (codeSnap.exists()) {
        const currentCode = codeSnap.data().value;
        await updateDoc(codeRef, {
          value: increment(1),
        });
        return `#${String(currentCode).padStart(3, "0")}`;
      } else {
        // Si no existe el documento, crearlo
        await setDoc(codeRef, { value: 2 });
        return "#001";
      }
    } catch (error) {
      console.error("Error al incrementar el código del producto:", error);
      throw error;
    }
  };

  // Incrementar el código del pedido (ej: #001, #002)
  const incrementOrdersCode = async () => {
    try {
        const codeRef = doc(db, "counters", "orderCode");
        const codeSnap = await getDoc(codeRef);
        
        if (codeSnap.exists()) {
          const currentCode = codeSnap.data().value;
          await updateDoc(codeRef, {
            value: increment(1)
          });
          return `#${String(currentCode).padStart(3, "0")}`;
        } else {
          // Si no existe el documento, crearlo
          await setDoc(codeRef, { value: 2 });
          return "#001";
        }
      } catch (error) {
        console.error("Error al incrementar el código del pedido:", error);
        throw error;
      }
  };

  const createOrderWithProducts = async (fecha, cliente, telefono, direccion, products) => {  
    console.log('llamado exitoso');
    console.log(fecha, cliente, telefono, direccion, products);
  
    try {
        // Validar stock de todos los productos
        for (const element of products) {
            const product = element.item;
            const productRef = doc(db, "products", product.id);
            const productSnapshot = await getDoc(productRef);
            
            if (!productSnapshot.exists()) {
                console.error(`Producto ${product.id} no existe`);
                return false;
            }
            
            const currentStock = Number(productSnapshot.data().stock);
            if (currentStock < Number(element.quantity)) {
                console.error(`Stock insuficiente para ${product.id}`);
                return false;
            }
        }

        const orderCode = await incrementOrdersCode();
        // Crear el pedido en la colección "orders"
        const pedidoRef = await addDoc(collection(db, "orders"), {
            orderCode,
            fecha,
            cliente,
            telefono,
            direccion,
            estado: "pendiente",
        });

        // Procesar productos y actualizar stock
        for (const element of products) {
            const product = element.item;
            const productRef = doc(db, "products", product.id);
            const productSnapshot = await getDoc(productRef);
            const currentStock = Number(productSnapshot.data().stock);
            console.log(productSnapshot.data());
            
            const quantityNumber = Number(element.quantity);

            // ⚡ Guardar snapshot del producto en la orden
            await addDoc(collection(db, `orders/${pedidoRef.id}/products`), {
                productRef, // Se mantiene la referencia por si se necesita
                productSnapshot: { // Snapshot de los datos actuales del producto
                    name: productSnapshot.data().name,
                    price: productSnapshot.data().price,
                    productCode: productSnapshot.data().productCode,
                    size: productSnapshot.data().size,
                    color: productSnapshot.data().color,
                },
                stock: quantityNumber,
                verified: 0
            });

            // Actualizar el stock del producto en el inventario
            const newStockInt = currentStock - quantityNumber;
            await updateDoc(productRef, {
                stock: newStockInt
            });
        }

        return pedidoRef.id;
    } catch (error) {
        console.error("Error en el procesamiento del pedido:", error);
        return false;
    }
};



  const [user, setUser] = useState(false);

  return {
    getOrders,
    createOrderWithProducts,
    addProduct,
    getProducts,
    getProduct,
    deleteProduct,
    incrementProductCode,
    incrementOrdersCode,
    updateProduct,
    getOrderById,
    filterOrdersByDate,  
    updateOrder,
    deleteOrder,
    getProductsByOrder,
    user, setUser, getAdmin,
    products
  };
};

export default useFirestore;
