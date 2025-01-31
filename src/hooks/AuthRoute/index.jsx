import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useFirestoreContext from "../../hooks/useFirestoreContext";

function AuthRoute({ children }) {
    const { user } = useFirestoreContext(); // Consumimos el contexto correctamente
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user && location.pathname !== "/login") {
            navigate("/login"); // Si no está autenticado, redirigir a login
        } else if (user && location.pathname === "/login") {
            navigate("/home"); // Si ya está autenticado y está en login, enviarlo a home
        }
    }, [user, location.pathname, navigate]);

    if (!user && location.pathname !== "/login") {
        return null; // No renderiza rutas protegidas si no está autenticado
    }

    return children;
}

export default AuthRoute;
