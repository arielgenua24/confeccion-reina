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
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where
} from "firebase/firestore";


const useFirestore = () => {
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
  const addProduct = async (name, price, details, stock) => {
    try {
        //obtenemos el codigo de el producto
    const productCode = await incrementProductCode();  
    console.log(productCode);

    // Convertir campos relevantes a minúsculas si son strings
    const processedName = typeof name === 'string' ? name.toLowerCase() : name;
    const processedDetails = typeof details === 'string' ? details : details;

      const docRef = await addDoc(collection(db, "products"), {
        productCode, // productCode usualmente tiene un formato específico, no se convierte
        name: processedName,
        price, // price es un número, no se convierte
        details: processedDetails,
        stock, // stock es un número, no se convierte
        updatedAt: formattedDate,
      });
      console.log("Producto agregado con ID: ", docRef.id);
      const productId = docRef.id;
      return productId;
    } catch (e) {
      console.error("Error agregando producto: ", e);
    }
  };

  // Obtener products con paginación
  const getProducts = async (limitParam = 10, startAfterDoc = null) => { 
    try {
      const productsRef = collection(db, "products");
      let q; 

      if (startAfterDoc) {
        // Si hay un documento de inicio, paginar desde ahí
        q = query(productsRef, orderBy("productCode"), startAfter(startAfterDoc), limit(limitParam));
      } else {
        // Si es la primera página, empezar desde el principio
        q = query(productsRef, orderBy("productCode"), limit(limitParam));
      }

      const productsSnapshot = await getDocs(q); 
      const productsData = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const lastVisibleDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1]; 

      return { products: productsData, lastVisibleDoc }; 
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
            // Handle both old format (element.item) and new format (element.product)
            const product = element.product || element.item;
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
            // Handle both old format (element.item) and new format (element.product)
            const product = element.product || element.item;
            const productRef = doc(db, "products", product.id);
            const productSnapshot = await getDoc(productRef);
            const currentStock = Number(productSnapshot.data().stock);
            console.log(productSnapshot.data());
            
            const quantityNumber = Number(element.quantity);

            // ⚡ Guardar snapshot del producto en la orden con variantes seleccionadas
            const orderProduct = {
                productRef, // Se mantiene la referencia por si se necesita
                productSnapshot: { // Snapshot de los datos actuales del producto
                    name: productSnapshot.data().name,
                    price: productSnapshot.data().price,
                    productCode: productSnapshot.data().productCode,
                    details: productSnapshot.data().details || '',
                },
                stock: quantityNumber,
                verified: 0
            };
            
            // Add selected variants if they exist (new format)
            if (element.selectedVariants) {
                orderProduct.selectedVariants = {
                    size: element.selectedVariants.size || null,
                    color: element.selectedVariants.color || null
                };
            } else {
                // Backward compatibility: if it's old format, try to get size/color from product data
                orderProduct.selectedVariants = {
                    size: productSnapshot.data().size || null,
                    color: productSnapshot.data().color || null
                };
            }
            
            await addDoc(collection(db, `orders/${pedidoRef.id}/products`), orderProduct);

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



  // Nueva función para buscar productos por nombre o código
  const searchProductsByNameOrCode = async (searchTerm, limitParam = 10) => {
    console.log(`[searchProductsByNameOrCode] Received search term: "${searchTerm}"`); // <-- Log inicial
    if (!searchTerm || !searchTerm.trim()) {
      console.log("[searchProductsByNameOrCode] Search term is empty, returning empty array.");
      return [];
    }

    const productsRef = collection(db, "products");
    const searchTermClean = searchTerm.trim(); // Usar término sin espacios extra
    const searchTermLower = searchTermClean.toLowerCase();
    const searchTermUpper = searchTermClean.toUpperCase();

    const endTermLower = searchTermLower.slice(0, -1) + String.fromCharCode(searchTermLower.charCodeAt(searchTermLower.length - 1) + 1);
    const endTermUpper = searchTermUpper.slice(0, -1) + String.fromCharCode(searchTermUpper.charCodeAt(searchTermUpper.length - 1) + 1);

    // --- Log de los términos y rangos ---
    console.log(`[searchProductsByNameOrCode] Cleaned Term: "${searchTermClean}"`);
    console.log(`[searchProductsByNameOrCode] Lower Range: >= "${searchTermLower}" AND < "${endTermLower}"`);
    console.log(`[searchProductsByNameOrCode] Upper Range: >= "${searchTermUpper}" AND < "${endTermUpper}"`);


    // --- Consultas ---
    const nameQueryLower = query(
      productsRef,
      where("name", ">=", searchTermLower),
      where("name", "<", endTermLower),
      limit(limitParam)
    );
    const nameQueryUpper = query(
      productsRef,
      where("name", ">=", searchTermUpper),
      where("name", "<", endTermUpper), // Corregido de endTermLower a endTermUpper
      limit(limitParam)
    );
    const codeQueryLower = query(
      productsRef,
      where("productCode", ">=", searchTermLower), // Asumimos case-insensitive para código también
      where("productCode", "<", endTermLower),
      limit(limitParam)
    );
    const codeQueryUpper = query(
      productsRef,
      where("productCode", ">=", searchTermUpper),
      where("productCode", "<", endTermUpper),
      limit(limitParam)
    );


    try {
      console.log("[searchProductsByNameOrCode] Executing Firestore queries...");
      const [nameSnapLower, nameSnapUpper, codeSnapLower, codeSnapUpper] = await Promise.all([
        getDocs(nameQueryLower),
        getDocs(nameQueryUpper),
        getDocs(codeQueryLower),
        getDocs(codeQueryUpper),
      ]);
      console.log("[searchProductsByNameOrCode] Queries finished.");

      // --- Log de resultados por consulta ---
      console.log(`[searchProductsByNameOrCode] Name Lower Hits: ${nameSnapLower.docs.length}`, nameSnapLower.docs.map(d => ({id: d.id, ...d.data()})));
      console.log(`[searchProductsByNameOrCode] Name Upper Hits: ${nameSnapUpper.docs.length}`, nameSnapUpper.docs.map(d => ({id: d.id, ...d.data()})));
      console.log(`[searchProductsByNameOrCode] Code Lower Hits: ${codeSnapLower.docs.length}`, codeSnapLower.docs.map(d => ({id: d.id, ...d.data()})));
      console.log(`[searchProductsByNameOrCode] Code Upper Hits: ${codeSnapUpper.docs.length}`, codeSnapUpper.docs.map(d => ({id: d.id, ...d.data()})));


      // Combinar y eliminar duplicados
      const combinedResults = new Map();
      const processSnapshot = (snapshot) => {
        snapshot.docs.forEach(doc => {
          if (!combinedResults.has(doc.id)) {
            combinedResults.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });
      };

      processSnapshot(nameSnapLower);
      processSnapshot(nameSnapUpper);
      processSnapshot(codeSnapLower);
      processSnapshot(codeSnapUpper);

      const finalResults = Array.from(combinedResults.values());
      console.log(`[searchProductsByNameOrCode] Final combined results count: ${finalResults.length}`);
      // console.log("[searchProductsByNameOrCode] Final combined results:", finalResults); // Log detallado opcional si el anterior no es suficiente

      return finalResults;

    } catch (error) {
      // --- Log de errores detallado ---
      console.error("[searchProductsByNameOrCode] Error searching products:", error);
      console.error("[searchProductsByNameOrCode] Error Code:", error.code); // Código de error de Firestore
      console.error("[searchProductsByNameOrCode] Error Message:", error.message); // Mensaje de error
      return [];
    }
  };

  // Nueva función para obtener todos los productos sin paginación
  const getAllProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      // Ordenamos por productCode para mantener consistencia, aunque no es estrictamente necesario
      // si no se va a paginar. Puede ser útil para debug o si se decide añadir un límite en el futuro.
      const q = query(productsRef, orderBy("productCode")); 
      
      const productsSnapshot = await getDocs(q);
      const productsData = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      return productsData; // Devuelve un array de productos
    } catch (error) {
      console.error("Error al obtener todos los productos:", error);
      throw error;
    }
  };

  const [user, setUser] = useState(false);

  return {
    getOrders,
    createOrderWithProducts,
    addProduct,
    getProducts, // La función original con paginación
    getAllProducts, // La nueva función sin paginación
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
    searchProductsByNameOrCode
  };
};

export default useFirestore;
