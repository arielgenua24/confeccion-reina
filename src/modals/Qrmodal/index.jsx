import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import './styles.css';

function QRmodal({ QRcode, setQRcode, orderCode }) {
  if (!QRcode) return null;

  const qrValue = orderCode
    ? JSON.stringify({ id: QRcode.id, code: QRcode.orderCode })
    : JSON.stringify({ id: QRcode.id, code: QRcode.productCode });

  const printPage = () => {
    window.print();
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const canvas = document.querySelectorAll('.qr-canvas');
    let yPos = 10;
    
    canvas.forEach((c) => {
      const imgData = c.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 10, yPos, 50, 50);
      yPos += 60;
    });
    pdf.save('QR-codes.pdf');
  };

  return (
    <div className="QR-modalOverlay">
      <div className="QR-modalContent">
        <div className="QR-container">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="QR-item">
              <h4 className="QR-title">
                {orderCode
                  ? `Pedido de: ${QRcode.cliente} Código: ${QRcode.orderCode}`
                  : `Producto: ${QRcode.name} Código: ${QRcode.productCode}`}
              </h4>
              <QRCodeCanvas className="qr-canvas" value={qrValue} size={80} />
            </div>
          ))}
        </div>
        
        <div className="QR-buttons">
          <button onClick={printPage}>Imprimir</button>
          <button onClick={downloadPDF}>Descargar</button>
          <button className="QR-closeButton" onClick={() => setQRcode(null)}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRmodal;
