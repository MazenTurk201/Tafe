import Main from '../Pages/MainPage';
import NotFound from '../Pages/404NotFoundPage';
import OrdersPage from '../Pages/Orders/OrdersPage';
import OrderDetailsPage from '../Pages/Orders/OrderDetailsPage';
import NewOrderPage from '../Pages/Orders/NewOrderPage';

export const routes = [
  { path: '/', element: <Main /> },
  { path: "/orders", element: <OrdersPage />, },
  { path: "/orders/new", element: <NewOrderPage />, },
  { path: "/orders/:id", element: <OrderDetailsPage />, },
  { path: '*', element: <NotFound /> }
];