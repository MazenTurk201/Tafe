import Main from '@/components/Pages/MainPage';
import NotFound from '@/components/Pages/404NotFoundPage';
import OrdersPage from '@/components/Pages/Orders/OrdersPage';
import OrderDetailsPage from '@/components/Pages/Orders/OrderDetailsPage';
import NewOrderPage from '@/components/Pages/Orders/NewOrderPage';
import UnitsPage from '@/components/Pages/UnitsPage';
import CategoriesPage from '@/components/Pages/CategoriesPage';
import IngredientsPage from '../Pages/Ingredients/IngredientsPage';

export const routes = [
  { path: '/', element: <Main /> },
  { path: "/orders", element: <OrdersPage />, },
  { path: "/orders/new", element: <NewOrderPage />, },
  { path: "/orders/:id", element: <OrderDetailsPage />, },
  { path: "/units", element: <UnitsPage />, },
  { path: "/categories", element: <CategoriesPage />, },
  { path: "/ingredients", element: <IngredientsPage />, },
  { path: '*', element: <NotFound /> }
];