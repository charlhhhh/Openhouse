import { createBrowserRouter, RouteObject } from 'react-router-dom';
import Root from './Root';
import Home from './pages/home';
import FindPartner from './pages/find';
import Account from './pages/account';
import Following from './pages/following';
import CreatePost from './pages/createPost';
import OAuthCallback from './pages/oauth/OAuthCallback';
import SavedTopics from './pages/savedTopics';
import BindSuccess from './pages/oauth/BindSuccess';
import ChatPage from './pages/chat';

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
        path: 'sage',
        element: <Home />,
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
      {
        path: 'bind_success',
        element: <BindSuccess />,
      },
      {
        path: 'chat/:peerUuid',
        element: <ChatPage />,
      }
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: '/'
});

export default router; 