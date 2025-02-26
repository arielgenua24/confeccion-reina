import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import { Inbox, ShoppingCart, List, Package } from 'lucide-react';
import useFirestoreContext from '../../hooks/useFirestoreContext';
import LoadingComponent from '../../components/Loading';
import './styles.css';

function Home() {
    const { order, setOrder, getCustomerData } = useOrder();
    const { user, getAdmin } = useFirestoreContext();
    const [loadingAdmin, setLoadingAdmin] = useState(false) // Estado para controlar la carga de admin
    const [admin, setAdmin] = useState(null); // Inicializamos admin como null o un valor que indique 'cargando'



    const [customerData, setCustomerData] = useState({
        customerName: order.customerName || '',
        phone: order.phone || '',
        address: order.address || '',
    });

    useEffect(() => {
        let data = getCustomerData();
        if (data.customerName !== '') {
            setOrder(data);
            setCustomerData(data);
        }

        const checkAdmin = async () => { // Función asíncrona para manejar la promesa
            setLoadingAdmin(true); // Iniciamos la carga de admin
            const adminData = await getAdmin(); // Esperamos a que la promesa se resuelva
            setAdmin(adminData); // Establecemos el estado admin con el valor resuelto
            setLoadingAdmin(false); // Finaliza la carga de admin
        };

        checkAdmin();

    }, []);

    const areProductsInOrder = order.products.length;

    return (
        <div className="home-container">
            <LoadingComponent isLoading={loadingAdmin} />
            <h1 className="home-title" 
                style={
                    {fontSize: '30px', 
                    textAlign: 'center', 
                    marginBottom: '20px', 
                    color: '#c4c4c4', 
                    position: 'absolute',
                    padding: '12px',
                    top: '13px'
                    }}>
                    Bienvenida a tu sistema de inventario Reina👑
                </h1>


        {admin && admin === user && ( <Link to="/inbox" className="home-link">
                <button className="home-btn inbox">
                    <Inbox size={24} className="home-icon" />
                    Dinero y notificaciones
                    <span className="home-subtext">Revisar dinero recibido y avisos</span>
                </button>
            </Link>)}
           

            <div className="home-orders-section">
                <Link to="/new-order" className="home-link">
                    <button className="home-btn order">
                        <ShoppingCart size={24} className="home-icon" />
                        {!areProductsInOrder ? 'Nuevo Pedido' : `Continuar el pedido de ${customerData.customerName}`}
                        <span className="home-subtext">Crea o continúa un nuevo pedido</span>
                    </button>
                </Link>

                <Link to="/orders" className="home-link">
                    <button className="home-btn order">
                        <List size={24} className="home-icon" />
                        Pedidos
                        <span className="home-subtext">Órdenes pendientes de los clientes</span>
                    </button>
                </Link>
            </div>

            <Link to="/inventory" className="home-link">
                <button className="home-btn catalog">
                    <Package size={24} className="home-icon" />
                    Catálogo
                    <span className="home-subtext">Agrega tus productos y controla tu stock</span>
                </button>
            </Link>
        </div>
    );
}

export default Home;
