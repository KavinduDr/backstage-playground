import {
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  commonSignInResolvers,
  createOAuthProviderFactory,
} from '@backstage/plugin-auth-node';
import { providerAuthenticator } from './authenticator';

export const authBackendModuleAsgardeoProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'asgardeo-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        providers: authProvidersExtensionPoint,
      },
      async init({ providers }) {
        providers.registerProvider({
          providerId: 'asgardeo',
          factory: createOAuthProviderFactory({
            authenticator: providerAuthenticator,
            signInResolver: commonSignInResolvers.emailMatchingUserEntityProfileEmail(),
          }),
        });
      },
    });
  },
});
