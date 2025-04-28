import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Root from './Root';
import Home from './pages/home';
import Login from './pages/login';
import FindPartner from './pages/find';
import Account from './pages/account';
import Sage from './pages/sage';
import Following from './pages/following';
import CreatePost from './pages/createPost';
import OAuthCallback from './pages/oauth/OAuthCallback';
import SavedTopics from './pages/savedTopics';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'sage',
        element: <Sage />,
      },
      {
        path: 'findPartner',
        element: <FindPartner />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      {
        path: 'following',
        element: <Following />,
      },
      {
        path: 'createPost',
        element: <CreatePost />,
      },
      {
        path: 'oauth_success',
        element: <OAuthCallback />,
      },
      {
        path: 'savedTopics',
        element: <SavedTopics />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: '/'
});

export default router; 