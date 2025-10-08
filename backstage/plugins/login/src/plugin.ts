import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const loginPlugin = createPlugin({
  id: 'login',
  routes: {
    root: rootRouteRef,
  },
});

export const LoginPage = loginPlugin.provide(
  createRoutableExtension({
    name: 'LoginPage',
    component: () =>
      import('./components/LoginCard').then(m => m.LoginCard),
    mountPoint: rootRouteRef,
  }),
);
