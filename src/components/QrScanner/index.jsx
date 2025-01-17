import QrReader from "react-qr-scanner";

// eslint-disable-next-line react/prop-types
const QrScanner = ({ onScan }) => {
  const handleScan = (data) => {
    if (data) {
      onScan(data.text); // Pasamos el texto del QR escaneado
    }
  };

  const handleError = (err) => {
    console.error("Error al escanear el QR:", err);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div>
      <h1>Escanear QR</h1>
      <QrReader
        delay={300}
        style={previewStyle}
        onError={handleError}
        onScan={handleScan}
      />
    </div>
  );
};

export default QrScanner;
