import { useEffect, useRef, useState } from 'react';
import { Landmark, ShieldCheck, X } from 'lucide-react';
import { doc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseSetUp';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import mercadoPagoLogo from '../../assets/mercado-pago-1.svg';
import './styles.css';

// This document is intentionally read directly from Firestore. Payment status
// must never be stored in IndexedDB, localStorage, or sessionStorage.
const paymentStatusRef = doc(db, 'metadata', 'paymentStatus');
const MERCADO_PAGO_LINK = 'https://mpago.la/1rZ6HUG';

function PaymentStatusModal() {
  const { user } = useFirestoreContext();
  const [isPayed, setIsPayed] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const hasServerReadRef = useRef(false);

  useEffect(() => {
    if (!user) return undefined;

    let isMounted = true;
    hasServerReadRef.current = false;
    setIsPayed(true);
    setIsDismissed(false);

    const applyPaymentStatus = (snapshot) => {
      const nextIsPayed = snapshot.exists() && snapshot.data().isPayed === true;
      setIsPayed(nextIsPayed);
      // Reopen the warning when the developer marks a previously paid account
      // as pending again. A normal user dismissal remains session-only.
      if (!nextIsPayed) setIsDismissed(false);
    };

    const readPaymentStatus = async () => {
      try {
        // A server-only read makes each app session check the latest status.
        const snapshot = await getDocFromServer(paymentStatusRef);
        if (isMounted) {
          // A missing field/document is deliberately unpaid by default.
          hasServerReadRef.current = true;
          applyPaymentStatus(snapshot);
        }
      } catch (error) {
        console.error('No se pudo consultar el estado de pago:', error);
        // Avoid blocking the customer because of a temporary network issue.
        if (isMounted) setIsPayed(true);
      }
    };

    readPaymentStatus();

    // Keep the open app in sync when the developer updates the status.
    const unsubscribe = onSnapshot(paymentStatusRef, (snapshot) => {
      // Ignore an SDK cache snapshot until the required server read completed.
      if (!isMounted || !hasServerReadRef.current) return;
      applyPaymentStatus(snapshot);
    }, (error) => {
      console.error('No se pudo sincronizar el estado de pago:', error);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  // Dismissal only lives in React state: reloading the app always checks
  // Firestore again, as required.
  if (!user || isPayed || isDismissed) return null;

  return (
    <div className="payment-status-overlay" role="presentation">
      <section
        className="payment-status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-status-title"
        aria-describedby="payment-status-description"
      >
        <div className="payment-status-header">
          <span className="payment-status-icon"><ShieldCheck size={24} strokeWidth={2.2} /></span>
          <button
            type="button"
            className="payment-status-close-icon"
            onClick={() => setIsDismissed(true)}
            aria-label="Cerrar aviso de pago"
          >
            <X size={20} />
          </button>
        </div>

        <p className="payment-status-eyebrow">Estado de cuenta</p>
        <h2 id="payment-status-title">Hay un pago pendiente</h2>
        <p id="payment-status-description" className="payment-status-description">
          Hemos notado que el sistema no se ha abonado correctamente. Para mantener el servicio activo,
          elegí una de las siguientes opciones de pago.
        </p>

        <a
          className="payment-status-option payment-status-option--mercado-pago"
          href={MERCADO_PAGO_LINK}
          target="_blank"
          rel="noreferrer"
        >
          <span className="payment-status-mercado-logo-box">
            <img src={mercadoPagoLogo} alt="Mercado Pago" className="payment-status-mercado-logo" />
          </span>
          <span>
            <strong>Abonar con Mercado Pago</strong>
            <small>Pago online · IVA + 6,60% por costos de plataforma</small>
          </span>
          <span className="payment-status-arrow" aria-hidden="true">→</span>
        </a>

        <div className="payment-status-option payment-status-option--transfer">
          <span className="payment-status-option-icon"><Landmark size={21} /></span>
          <span>
            <strong>Transferencia bancaria</strong>
            <small>Coordiná la transferencia directamente con tu desarrollador.</small>
          </span>
        </div>

        <button
          type="button"
          className="payment-status-close"
          onClick={() => setIsDismissed(true)}
        >
          Cerrar y continuar trabajando
        </button>
      </section>
    </div>
  );
}

export default PaymentStatusModal;
