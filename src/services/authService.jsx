import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../firebaseConfig";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Iniciar sesión
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(userCredential.user)
    return userCredential.user;
   
  } catch (error) {
    throw new Error("Error en el inicio de sesión: " + error.message);
  }
};

// Cerrar sesión
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error("Error al cerrar sesión: " + error.message);
  }
};
