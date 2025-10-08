import { createDevApp } from '@backstage/dev-utils';
import { loginPlugin, LoginPage } from '../src/plugin';

createDevApp()
  .registerPlugin(loginPlugin)
  .addPage({
    element: <LoginPage />,
    title: 'Root Page',
    path: '/login',
  })
  .render();
