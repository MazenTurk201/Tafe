import Main from '@/components/Pages/MainPage';
import NotFound from '@/components/Pages/404NotFoundPage';
import OrdersPage from '@/components/Pages/Orders/OrdersPage';
import OrderDetailsPage from '@/components/Pages/Orders/OrderDetailsPage';
import NewOrderPage from '@/components/Pages/Orders/NewOrderPage';
import UnitsPage from '@/components/Pages/UnitsPage';
import CategoriesPage from '@/components/Pages/CategoriesPage';
import IngredientsPage from '@/components/Pages/IngredientsPage';
import MenuPage from '@/components/Pages/MenuPage';
import ProfilePage from '@/components/Pages/ProfilePage';
import EmployeeManagementPage from '@/components/Pages/EmployeeManagementPage';
import ProductsPage from '@/components/Pages/ProductPage';
import ExpensesPage from '@/components/Pages/ExpensePage';
import SuppliersPage from '@/components/Pages/SuppliersPage';

export const routes = [
  { path: '/', element: <Main /> },
  { path: "/orders", element: <OrdersPage />, },
  { path: "/orders/new", element: <NewOrderPage />, },
  { path: "/orders/:id", element: <OrderDetailsPage />, },
  { path: "/units", element: <UnitsPage />, },
  { path: "/categories", element: <CategoriesPage />, },
  { path: "/ingredients", element: <IngredientsPage />, },
  { path: "/menu", element: <MenuPage />, },
  { path: "/profile", element: <ProfilePage />, },
  { path: "/employees", element: <EmployeeManagementPage />, },
  { path: "/products", element: <ProductsPage />, },
  { path: "/expenses", element: <ExpensesPage />, },
  { path: "/suppliers", element: <SuppliersPage />, },
  { path: "/suppliers", element: <SuppliersPage />, },
  { path: '*', element: <NotFound /> }
];