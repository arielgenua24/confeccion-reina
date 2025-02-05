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
    const canvas = document.querySelectorAll('.qr-canvas');
    let yPos = 10;
    
    canvas.forEach((c, index) => {
      // Configurar estilo de borde con un diseño más profesional
      pdf.setDrawColor(100); // Color gris más oscuro para el borde
      pdf.setLineWidth(0.7);
      pdf.rect(10, yPos, 190, 90, 'S'); // Rectángulo ligeramente más alto
      
      // Preparar texto con formato mejorado
      const detailLines = orderCode
        ? [
            `FECHA: ${QRcode.fecha}`,
            `Pedido de: ${QRcode.cliente}`,
            `Dirección: ${QRcode.direccion}`,
            `Teléfono: ${QRcode.telefono}`,
            `Código de Pedido: ${QRcode.orderCode}`
          ]
        : [
            `Producto: ${QRcode.name} - ${QRcode.color}`,
            `Talle: ${QRcode.size}`,
            `Precio: $${QRcode.price}`,
            `Código de Producto: ${QRcode.productCode}`
          ];
      
      // Configuraciones de estilo para texto
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(15, yPos + 10, detailLines[0]); // Primera línea en negrita
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      detailLines.slice(1).forEach((line, lineIndex) => {
        pdf.text(15, yPos + 17 + (lineIndex * 6), line);
      });
      
      // Añadir QR code con mejor posicionamiento
      const imgData = c.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 150, yPos + 20, 40, 40);
      
      // Aumentar posición vertical para el siguiente elemento
      yPos += 100; // Incremento mayor para más espacio entre elementos
    });
    
    pdf.save('Etiquetas-QR.pdf');
  };

  return (
    <div className="QR-modalOverlay">
      <div className="QR-modalContent">
        <div className="QR-container">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="QR-item">
              <h4 className="QR-title">
                {orderCode
                  ? `FECHA: ${QRcode.fecha} Pedido de: ${QRcode.cliente} Direccion: ${QRcode.direccion} Telefono: ${QRcode.telefono} Código: ${QRcode.orderCode}`
                  : `Producto: ${QRcode.name}-${QRcode.color} Talle: ${QRcode.size} Precio: $${QRcode.price} Código: ${QRcode.productCode}`}
              </h4>
              <QRCodeCanvas className="qr-canvas" value={qrValue} size={80} />
            </div>
          ))}
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
