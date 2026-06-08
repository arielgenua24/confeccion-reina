import { useState, useEffect } from 'react';
import './styles.css';

const COUNTDOWN_SECONDS = 35;

/**
 * Banner shown for orders that are still loading into Firestore (pending/syncing).
 * Tells the employee the order is uploading, that it can't be deleted yet, and
 * counts down 35s before revealing a "retry sync" button.
 */
// eslint-disable-next-line react/prop-types
function SyncingOrderBanner({ orderId, onRetry }) {
  const [round, setRound] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    setSecondsLeft(COUNTDOWN_SECONDS);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [round]);

  const handleRetry = () => {
    onRetry(orderId);
    setRound((r) => r + 1);
  };

  return (
    <div className="sync-banner sync-banner--loading">
      <div className="sync-loading-header">
        <span className="sync-spinner"></span>
        <span className="sync-loading-title">
          Esta orden se está cargando a la base de datos
        </span>
      </div>

      <p className="sync-loading-subtitle">
        No podrás eliminarla hasta que se haya cargado.
      </p>

      {secondsLeft > 0 ? (
        <span className="sync-countdown">
          Reintentando en {secondsLeft}s…
        </span>
      ) : (
        <button className="primary-btn" onClick={handleRetry}>
          Intentar de nuevo la sincronización
        </button>
      )}
    </div>
  );
}

export default SyncingOrderBanner;
