import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const EarningsModals = ({ orders }) => {
  const [showDaily, setShowDaily] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);

  // Cada vez que orders cambie, calculamos las ganancias diarias y mensuales.
  useEffect(() => {
    if (orders && orders.length) {
      setDailyEarnings(calculateDailyEarnings(orders));
      setMonthlyEarnings(calculateMonthlyEarnings(orders));
    }
  }, [orders]);

  // Función para agrupar ganancias por día
  const calculateDailyEarnings = (orders) => {
    const result = {};
    orders.forEach(order => {
      // Se asume que el formato de fecha es "dd/MM/yyyy, HH:mm"
      const [datePart] = order.fecha.split(',');
      // Acumulamos el total (asegurándonos de convertirlo a número)
      result[datePart] = (result[datePart] || 0) + Number(order.total);
    });
    // Convertimos el objeto en un array de objetos { date, total }
    return Object.entries(result).map(([date, total]) => ({ date, total }));
  };

  // Función para agrupar ganancias por mes
  const calculateMonthlyEarnings = (orders) => {
    const result = {};
    orders.forEach(order => {
      const [datePart] = order.fecha.split(',');
      // Separamos la fecha (asumimos formato "dd/MM/yyyy")
      const [day, month, year] = datePart.trim().split('/');
      const monthYear = `${month}/${year}`;
      result[monthYear] = (result[monthYear] || 0) + Number(order.total);
    });
    return Object.entries(result).map(([monthYear, total]) => ({ monthYear, total }));
  };

  // Configuración de datos para el gráfico de ganancias diarias
  const dailyChartData = {
    labels: dailyEarnings.map(item => item.date),
    datasets: [{
      label: 'Ganancias diarias',
      data: dailyEarnings.map(item => item.total),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }]
  };

  // Configuración de datos para el gráfico de ganancias mensuales
  const monthlyChartData = {
    labels: monthlyEarnings.map(item => item.monthYear),
    datasets: [{
      label: 'Ganancias mensuales',
      data: monthlyEarnings.map(item => item.total),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }]
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setShowDaily(true)} className="me-2">
        Ver Ganancias Diarias
      </Button>
      <Button variant="secondary" onClick={() => setShowMonthly(true)}>
        Ver Ganancias Mensuales
      </Button>

      {/* Modal de Ganancias Diarias */}
      <Modal show={showDaily} onHide={() => setShowDaily(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ganancias Diarias</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dailyEarnings.map((item, index) => (
            <p key={index}>
              <strong>{item.date}</strong>: Total: {item.total}
            </p>
          ))}
          <Bar data={dailyChartData} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDaily(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Ganancias Mensuales */}
      <Modal show={showMonthly} onHide={() => setShowMonthly(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ganancias Mensuales</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {monthlyEarnings.map((item, index) => (
            <p key={index}>
              <strong>{item.monthYear}</strong>: Total: {item.total}
            </p>
          ))}
          <Bar data={monthlyChartData} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMonthly(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EarningsModals;
