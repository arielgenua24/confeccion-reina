import { useState, useEffect } from "react";

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from '../../firebaseConfig'; // Importa tu configuración
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 // Importa la configuración de Firebase
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  increment,
  updateDoc,
  setDoc
} from "firebase/firestore";


const useFirestore = () => {
  const [products, setProducts] = useState([]);


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

  const updateProductQuantity = async (productId, quantity) => {
    const { productRef } = await getProduct(productId);

    return updateDoc(productRef, {
      stock: quantity,
    });
  }

  


  // Obtener un producto por ID
  const getProduct = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);
      console.log(productSnap);
      if (productSnap.exists()) {
        return {productRef, id: productSnap.id, ...productSnap.data() };
      } else {
        throw new Error("El producto no existe");
      }
    } catch (error) {
      console.error("Error al obtener el producto:", error);
      throw error;
    }
  };


//Ejecutaremos esta funcion una vez el usuario llego a la instacia final de la orden
  const createOrderWithProducts = async (fecha, cliente, telefono, direccion, products) => {  
    try {
        //obtenemos el codigo de la ordern
        const orderCode = await incrementOrdersCode();  

      // Agregar el pedido principal
      const pedidoRef = await addDoc(collection(db, "orders"), {
        orderCode,
        fecha,
        cliente,
        telefono,
        direccion,
      });
  
      // Agregar products a la subcolección
      for (const product of products) {
        const productRef = doc(db, "products", product.productoId);
        await addDoc(collection(db, `orders/${pedidoRef.id}/products`), {
          productRef,
          cantidad: product.cantidad
        });

        await updateDoc(productRef, {
            cantidad: increment(-product.cantidad), // Disminuye la cantidad en Firestore
          });
      }
  
      console.log("Pedido creado con ID: ", pedidoRef.id);
    } catch (e) {
      console.error("Error creando pedido: ", e);
    }
  };
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
          // Create document if doesn't exist
          await setDoc(codeRef, { value: 1 });
          return "#001";
        }
      } catch (error) {
        console.error("Error al incrementar el código del pedido:", error);
        throw error;
      }
  };

  return {
    getOrders,
    createOrderWithProducts,
    addProduct,
    getProducts,
    getProduct,
    incrementProductCode,
    incrementOrdersCode,
    updateProductQuantity,
    products
  };
};

export default useFirestore;
