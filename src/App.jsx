import { HashRouter, Link, useRoutes } from 'react-router-dom'
import './App.css'
import Inventory from './pages/Inventory'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import BackNav from './components/navbar'
import { FirestoreProvider } from './context/firestoreContext'
import Product from './pages/Products'

function AppRouter() {
  let router = useRoutes([
    { path: '/', element: <Home />},
    { path: '/home', element: <Home />},
    { path:'/inventory' , element: <Inventory /> },
    { path:'/product/:id' , element: <Product /> },
    { path:'/orders' , element: <Orders /> }, 
    { path:'/new-order' , element: <NewOrder /> }, 
  ])
  return router;
}

function Home() {
  return (
    <div className="app-container">
      <div className="orders-section">
        <Link to="/new-order">
          <button className="pages-btn">Nuevo Pedido</button>
        </Link>
        <Link to="/orders">
          <button className="pages-btn">orders</button>
        </Link>
      </div>
      <Link to="/inventory">
        <button className="pages-btn">Catálogo</button>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <FirestoreProvider >
        <BackNav />
        <AppRouter />
      </ FirestoreProvider>
    </HashRouter>
  );
}