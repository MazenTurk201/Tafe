import Main from '../Pages/MainPage';
import NotFound from '../Pages/404NotFoundPage';
import OrdersPage from '../Pages/Orders/OrdersPage';
import OrderDetailsPage from '../Pages/Orders/OrderDetailsPage';

export const routes = [
  { path: '/', element: <Main /> },
  { path: "/orders", element: <OrdersPage />, },
  { path: "/orders/:id", element: <OrderDetailsPage />, },
  { path: '*', element: <NotFound /> }
];