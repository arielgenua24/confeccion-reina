import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebaseSetUp';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './styles.css';

function TeamNotes() {
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load session from sessionStorage
  useEffect(() => {
    const savedSession = sessionStorage.getItem('teamNotesSession');
    if (savedSession) {
      setSession(savedSession);
    }
  }, []);

  // Save session to sessionStorage
  useEffect(() => {
    if (session) {
      sessionStorage.setItem('teamNotesSession', session);
    }
  }, [session]);

  // Real-time listener for messages
  useEffect(() => {
    const q = query(collection(db, 'teamNotes'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session.trim() || !message.trim()) {
      alert('Por favor completa ambos campos');
      return;
    }

    setIsSending(true);

    try {
      await addDoc(collection(db, 'teamNotes'), {
        session: session.trim(),
        message: message.trim(),
        createdAt: serverTimestamp()
      });

      setMessage(''); // Clear message but keep session
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if same day
    if (date.toDateString() === today.toDateString()) {
      return `Hoy ${format(date, 'HH:mm', { locale: es })}`;
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
    }

    // Other dates
    return format(date, "d 'de' MMMM, HH:mm", { locale: es });
  };

  return (
    <div className="team-notes-container">
      <div className="team-notes-header">
        <h2>📝 Notas del Equipo</h2>
        <p className="team-notes-subtitle">Registro de eventos y comunicación interna</p>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>No hay mensajes aún</p>
            <span className="empty-hint">Sé el primero en dejar una nota</span>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="message-bubble">
            <div className="message-header">
              <span className="message-session">{msg.session}</span>
              <span className="message-time">
                {formatMessageDate(msg.createdAt)}
              </span>
            </div>
            <div className="message-content">
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-inputs">
          <input
            type="text"
            className="session-input"
            placeholder="Tu nombre o turno (ej: Mañana, Juan)"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            disabled={isSending}
          />

          <div className="message-input-wrapper">
            <input
              type="text"
              className="message-input"
              placeholder="Escribe una nota..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isSending || !session.trim() || !message.trim()}
            >
              {isSending ? '...' : '↑'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default TeamNotes;
