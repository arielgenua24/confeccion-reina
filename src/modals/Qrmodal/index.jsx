/* eslint-disable react/prop-types */
import './styles.css';
import { QRCodeCanvas } from 'qrcode.react';

function QRmodal({QRcode, setQRcode}) {
    console.log(QRcode.productCode); //se repite constantemente
    return (
        <div className="QR-modalOverlay">
          <div className="QR-modalContent">
            <h4>QR Code para: {QRcode.name} Codigo: 
               {QRcode.productCode}
              </h4>
            {/* TO DO: CODE SMT LIKE THIS WITH YOU SLUG: value={JSON.stringify({
    url: `https://www.tutienda.com/producto/${product.productCode}`,
    code: QRCODE,
  })} */}
          
            <QRCodeCanvas value={JSON.stringify({id: QRcode.id, code: QRcode.productCode})} size={200} />
            <button className="QR-closeButton" onClick={() => setQRcode(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )
}

export default QRmodal;