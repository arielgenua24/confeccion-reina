import { HashRouter, Link, useRoutes } from 'react-router-dom'
import './App.css'
import Inventory from './pages/Inventory'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import BackNav from './components/navbar'
import SelectProducts from './pages/Select-products'
import SelectProductAmount from './modals/SelectProductAmount'
import QrSearchHandler from './components/QrSearchHandler'

import { FirestoreProvider } from './context/firestoreContext'
import { OrderProvider } from './context/OrderContext'

import Product from './pages/Products'

function AppRouter() {
  let router = useRoutes([
    { path: '/', element: <Home />},
    { path: '/home', element: <Home />},
    { path:'/inventory' , element: <Inventory /> },
    { path:'/cart' , element: <Cart /> },
    { path:'/product/:id' , element: <Product /> },
    { path:'/orders' , element: <Orders /> }, 
    { path:'/new-order' , element: <NewOrder /> }, 
    { path:'/Select-products' , element: <SelectProducts /> }, 
    { path:'/select-product-amount/:id' , element: <SelectProductAmount /> },
    { path:'/qrsearch' , element: <QrSearchHandler /> }, 
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
        <OrderProvider >
          <BackNav />
          <AppRouter />
        </OrderProvider>
      </ FirestoreProvider>
    </HashRouter>
  );
}