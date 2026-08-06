import Main from '../Pages/MainPage';
import NotFound from '../Pages/404NotFoundPage';

export const routes = [
  { path: '/', element: <Main /> },
  { path: '*', element: <NotFound /> }
];