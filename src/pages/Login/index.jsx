import { useState } from "react";
import {login} from "../../services/authService";
import useFirestoreContext from "../../hooks/useFirestoreContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
 const navigate = useNavigate();
  const {user, setUser} = useFirestoreContext()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        console.log(email, password)
      const newUser = await login(email, password);
      alert("Inicio de sesión exitoso");
      setUser(email);
      if(newUser) {
        navigate(-2)
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Iniciar Sesión</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;
