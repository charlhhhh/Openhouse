import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import Following from './pages/following';
import Find from './pages/find';
import Layout from './Layout';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'following',
        element: <Following />,
      },
      {
        path: 'find',
        element: <Find />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
];

const router = createBrowserRouter(routes);

export default router; 