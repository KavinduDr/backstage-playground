import {
  // ScmIntegrationsApi,
  // scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  ApiRef,
  BackstageIdentityApi,
  configApiRef,
  createApiFactory,
  createApiRef,

  discoveryApiRef,

  oauthRequestApiRef,

  OpenIdConnectApi,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/core-plugin-api';
import { OAuth2 } from '@backstage/core-app-api';

export const asgardeoAuthApiRef: ApiRef<
  OpenIdConnectApi & ProfileInfoApi & BackstageIdentityApi & SessionApi
> = createApiRef({
  id: 'auth.asgardeo-provider',
})

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: asgardeoAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
      oauthRequestApi: oauthRequestApiRef,
      configApi: configApiRef,
    },
    factory: ({ discoveryApi, oauthRequestApi, configApi }) => OAuth2.create({
      configApi,
      discoveryApi,
      oauthRequestApi,
      provider: {
        id: 'asgardeo',
        title: 'Asgardeo custom auth provider',
        icon: () => null,
      },
      environment: configApi.getOptionalString('auth.environment'),
      defaultScopes: ['openid', 'profile', 'email'],
      popupOptions: {
        // optional, used to customize login in popup size
        size: {
          fullscreen: true,
        },
        /**
         * or specify popup width and height
         * size: {
            width: 1000,
            height: 1000,
          }
         */
      },
    })
  }),
  ScmAuth.createDefaultApiFactory(),
];
