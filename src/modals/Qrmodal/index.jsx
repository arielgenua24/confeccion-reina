import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './styles.css';
import { QrCode } from 'lucide-react';

function QRmodal({ QRcode, setQRcode, orderCode }) {
  if (!QRcode) return null;

  console.log(QRcode)

  const [productData, setProductData] = useState(`Producto: ${QRcode.name}-${QRcode.color} Código: ${QRcode.productCode} Talle: ${QRcode.size}`)

  


  const qrValue = orderCode
    ? JSON.stringify({ id: QRcode.id, code: QRcode.orderCode, estado: QRcode.estado })
    : JSON.stringify({ id: QRcode.id, code: QRcode.productCode });

    console.log(qrValue)

  const printPage = () => {
    window.print();
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const canvases = document.querySelectorAll('.qr-canvas');
  
    if (orderCode) {
      // Si existe orderCode, se imprime un solo QR con detalles
      let yPos = 10;
      const detailLines = [
        `FECHA: ${QRcode.fecha}`,
        `Pedido de: ${QRcode.cliente}`,
        `Dirección: ${QRcode.direccion}`,
        `Teléfono: ${QRcode.telefono}`,
        `Código de Pedido: ${QRcode.orderCode}`
      ];
  
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(15, yPos + 10, detailLines[0]);
      detailLines.slice(1).forEach((line, lineIndex) => {
        pdf.text(15, yPos + 17 + (lineIndex * 6), line);
      });
  
      const imgData = canvases[0].toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 150, yPos + 20, 40, 40);
    } else {
      // Sin orderCode: queremos 12 QR organizados en 4 filas x 3 columnas
      const columns = 3;       // 3 columnas
      const cellWidth = 60;    // Ancho de cada celda
      const cellHeight = 60;   // Alto de cada celda
      const marginX = 10;      // Margen horizontal
      const marginY = 10;      // Margen vertical
  
      canvases.forEach((c, index) => {
        const col = index % columns;             // Columna: 0, 1, 2
        const row = Math.floor(index / columns);   // Fila: 0 a 3 (4 filas en total)
        const xPos = marginX + col * cellWidth;
        const yPos = marginY + row * cellHeight;
  
        pdf.setDrawColor(100);
        pdf.setLineWidth(0.7);
        pdf.rect(xPos, yPos, cellWidth, cellHeight, 'S');
  
        const qrSize = 40;
        const xQr = xPos + (cellWidth - qrSize) / 2;
        const yQr = yPos + (cellHeight - qrSize) / 2;
  
        const imgData = c.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', xQr, yQr, qrSize, qrSize);
      });
    }
  
    pdf.save('Etiquetas-QR.pdf');
  };
  

  return (
    <div className="QR-modalOverlay">
      <div className="QR-modalContent">
        <div className="QR-container">
          {orderCode ? ([...Array(1)].map((_, index) => (
            <div key={index} className="QR-item">
              <h4 className="QR-title">
                 {`FECHA: ${QRcode.fecha} Pedido de: ${QRcode.cliente} Direccion: ${QRcode.direccion} Telefono: ${QRcode.telefono} Código: ${QRcode.orderCode}`}
              </h4>
              <QRCodeCanvas className="qr-canvas" value={qrValue} size={80} />
            </div>
          ))): ([...Array(12)].map((_, index) => (
            <div key={index} className="QR-item">
              <h4 className="QR-title">
                {`Producto: ${QRcode.name}`}
              </h4>
              <QRCodeCanvas className="qr-canvas" value={qrValue} size={80} />
            </div>
          ))) }
           {/*[...Array(3)].map((_, index) => (
            <div key={index} className="QR-item">
              <h4 className="QR-title">
                {orderCode
                  ? `FECHA: ${QRcode.fecha} Pedido de: ${QRcode.cliente} Direccion: ${QRcode.direccion} Telefono: ${QRcode.telefono} Código: ${QRcode.orderCode}`
                  : `Producto: ${QRcode.name}-${QRcode.color} Talle: ${QRcode.size} Precio: $${QRcode.price} Código: ${QRcode.productCode}`}
              </h4>
              <QRCodeCanvas className="qr-canvas" value={qrValue} size={80} />
            </div>
          )) */ }
        </div>
        
        <div className="QR-buttons">
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
