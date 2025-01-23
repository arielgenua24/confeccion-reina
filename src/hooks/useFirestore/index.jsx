import { useState } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


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
  setDoc,
  deleteDoc
} from "firebase/firestore";


const useFirestore = () => {
  const [products, setProducts] = useState([]);

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'yyyy-MM-dd HH:mm:ss', { locale: es });

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
    console.log('llamado exitoso')
    console.log(fecha, cliente, telefono, direccion, products)
    try {
      // Primero, validar el stock de todos los productos
      for (const element of products) {
        const product = element.item;
        const productRef = doc(db, "products", product.id);
    
        const productSnapshot = await getDoc(productRef);
        if (!productSnapshot.exists()) {
          console.error(`Producto ${product.id} no existe`);
          return false;
        }
    
        const currentStock = productSnapshot.data().stock;
        if (currentStock < element.quantity) {
          console.error(`Stock insuficiente para ${product.id}`);
          return false;
        }
      }

      const orderCode = await incrementOrdersCode();
      // Si todos los productos tienen stock, crear el pedido
      const pedidoRef = await addDoc(collection(db, "orders"), {
        orderCode,
        fecha,
        cliente,
        telefono,
        direccion,
      });
    
      // Procesar productos y actualizar stock
      for (const element of products) {
        const product = element.item;
        const productRef = doc(db, "products", product.id);
    
        await addDoc(collection(db, `orders/${pedidoRef.id}/products`), {
          productRef,
          stock: element.quantity
        });
    
        //bug-> me fija la cantidad, en vez de restar, la agrega como una string.
        console.log(element.quantity)
        await updateDoc(productRef, {
          stock: increment(element.quantity * -1)
        });
      }
    
      return true;
    } catch (error) {
      console.error("Error en el procesamiento del pedido:", error);
      return false;
    }
  };


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
    products
  };
};

export default useFirestore;
