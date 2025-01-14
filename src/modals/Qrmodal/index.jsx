/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import './styles.css';
import { QRCodeCanvas } from 'qrcode.react';

function QRmodal({QRcode, setIsQRModalOpen}) {
    console.log(QRcode);
    return (
        <div className="QR-modalOverlay">
          <div className="QR-modalContent">
            <h4>QR Code para: {QRcode}</h4>
            {/* TO DO: CODE SMT LIKE THIS WITH YOU SLUG: value={JSON.stringify({
    url: `https://www.tutienda.com/producto/${product.productCode}`,
    code: QRCODE,
  })} */}
            <QRCodeCanvas value={QRcode} size={200} />
            <button className="QR-closeButton" onClick={() => setIsQRModalOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )
}

export default QRmodal;