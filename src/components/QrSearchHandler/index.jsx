import QrScanner from "../QrScanner";
import beep_sound from "../../assets/sounds/beep_sound.mp3";
import { useNavigate } from "react-router-dom";
// import QrInputSearch from "./QrInputSearch";

const QrSearchHandler = () => {
  const navigate = useNavigate();
  const handleScan = (data) => {
    console.log("Datos escaneados:", data);
    const parsedData = JSON.parse(data);
    const audio = new Audio(beep_sound);  // Ruta de tu archivo de sonido
    audio.play();
    navigate(`/product/${parsedData.id}`);
    // Suponemos que el QR contiene un string como "order:12345" o "product:67890"
  };

  return (
    <div>
      <h1>Escanea un código QR</h1>
      <QrScanner onScan={handleScan} />
    </div>
  );
};

export default QrSearchHandler;