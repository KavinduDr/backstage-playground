import { createBackendModule } from '@backstage/backend-plugin-api';
import { authProvidersExtensionPoint, createOAuthProviderFactory, commonSignInResolvers } from '@backstage/plugin-auth-node';
import { providerAuthenticator } from '@internal/plugin-auth-backend-backend-module-foobar-provider/src/authenticator';

export const authModuleAsgardeoProvider = createBackendModule({
    pluginId: 'auth',
    moduleId: 'asgardeo-auth-provider',
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

export default authModuleAsgardeoProvider;