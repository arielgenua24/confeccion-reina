import { QrCode } from "lucide-react";

// eslint-disable-next-line react/prop-types
const QRButton = ({ product, onQRGenerate, }) => {
  return (
    <div className={`QR-buttonContaine`}>
      <button
        style={{
          backgroundColor: "#fff",
          border: "3px solid rgb(9, 144, 255)",
          display: "flex",
          alignItems: "center"
        }}
        className="QR-qrButton"
        onClick={() => onQRGenerate(product)}
      >
       <QrCode size="24" /> 
        Obtener QR
      </button>
    </div>
  );
};

export default QRButton;