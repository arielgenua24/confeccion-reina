import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useFirestoreContext from "../../hooks/useFirestoreContext";
import Loading from "../../components/Loading";

// eslint-disable-next-line react/prop-types
function AuthRoute({ children }) {
    const { user, getAdmin } = useFirestoreContext();
    const [admin, setAdmin] = useState(null); // Inicializamos admin como null o un valor que indique 'cargando'
    const [loadingAdmin, setLoadingAdmin] = useState(true); // Estado para controlar la carga de admin
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        const checkAdmin = async () => { // Función asíncrona para manejar la promesa
            setLoadingAdmin(true); // Iniciamos la carga de admin
            const adminData = await getAdmin(); // Esperamos a que la promesa se resuelva
            setAdmin(adminData); // Establecemos el estado admin con el valor resuelto
            setLoadingAdmin(false); // Finaliza la carga de admin
        };

        checkAdmin(); // Llamamos a la función asíncrona

        if (!user && location.pathname !== "/login") {
            navigate("/login");
        } else if (user && location.pathname === "/login") {
            navigate("/home");
        }
    }, [user, location.pathname, navigate, getAdmin]); // Añadimos getAdmin a las dependencias

    if (!user && location.pathname !== "/login") {
        return null; // No renderiza rutas protegidas si no está autenticado
    }

   

    if (user !== admin && location.pathname === "/inbox") { // Verificamos que admin no sea null antes de comparar
        console.log("Usuario:", user);
        console.log("Admin:", admin);
        navigate("/home");
    }


    return children;
}

export default AuthRoute;