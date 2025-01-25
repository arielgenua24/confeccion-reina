// eslint-disable-next-line react/prop-types
const QRButton = ({ product, onQRGenerate, }) => {
  return (
    <div className={`QR-buttonContaine`}>
      <button
        className="QR-qrButton"
        onClick={() => onQRGenerate(product)}
      >
        Obtener QR
      </button>
    </div>
  );
};

export default QRButton;