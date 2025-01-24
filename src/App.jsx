import { HashRouter, useRoutes } from 'react-router-dom'
import './App.css'
import Inventory from './pages/Inventory'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import BackNav from './components/navbar'
import SelectProducts from './pages/Select-products'
import SelectProductAmount from './modals/SelectProductAmount'
import QrSearchHandler from './components/QrSearchHandler'
import SuccededOrder from './pages/Succeded-order'
import Home from './pages/Home'

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
    { path:'/succeeded-order/:id' , element: <SuccededOrder /> }, 
  ])
  return router;
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