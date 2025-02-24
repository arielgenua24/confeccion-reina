import { HashRouter, useRoutes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import BackNav from './components/navbar';
import QrSearchHandler from './components/QrSearchHandler';
import AuthRoute from './hooks/AuthRoute';

import { FirestoreProvider } from './context/firestoreContext';
import { OrderProvider } from './context/OrderContext';

// Lazy load de páginas
const Inventory = lazy(() => import('./pages/Inventory'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const NewOrder = lazy(() => import('./pages/NewOrder'));
const SelectProducts = lazy(() => import('./pages/Select-products'));
const SelectProductAmount = lazy(() => import('./modals/SelectProductAmount'));
const SuccededOrder = lazy(() => import('./pages/Succeded-order'));
const ProductVerification = lazy(() => import('./pages/ProductsVerification'));
const Inbox = lazy(() => import('./pages/inbox'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Product = lazy(() => import('./pages/Products'));

function AppRouter() {
  let router = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/home', element: <Home /> },
    { path: '/inventory', element: <Inventory /> },
    { path: '/cart', element: <Cart /> },
    { path: '/product/:id', element: <Product /> },
    { path: '/orders', element: <Orders /> },
    { path: '/ProductsVerification/:orderId', element: <ProductVerification /> },
    { path: '/new-order', element: <NewOrder /> },
    { path: '/Select-products', element: <SelectProducts /> },
    { path: '/select-product-amount/:id', element: <SelectProductAmount /> },
    { path: '/qrsearch', element: <QrSearchHandler /> },
    { path: '/succeeded-order/:id', element: <SuccededOrder /> },
    { path: '/inbox', element: <Inbox /> },
    { path: '/login', element: <Login /> },
  ]);
  return router;
}

export default function App() {
  return (
    <HashRouter>
      <FirestoreProvider>
        <OrderProvider>
          <BackNav />
          <AuthRoute>
            <Suspense fallback={<div>Cargando...</div>}>
              <AppRouter />
            </Suspense>
          </AuthRoute>
        </OrderProvider>
      </FirestoreProvider>
    </HashRouter>
  );
}
