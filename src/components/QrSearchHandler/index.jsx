import QrScanner from "../QrScanner";
// import QrInputSearch from "./QrInputSearch";

const QrSearchHandler = () => {
  const handleScan = (data) => {
    console.log("Datos escaneados:", data);

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