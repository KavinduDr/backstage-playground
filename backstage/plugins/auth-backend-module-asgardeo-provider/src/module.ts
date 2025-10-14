import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthAuthenticator,
  createOAuthProviderFactory,
  PassportOAuthAuthenticatorHelper,
  PassportOAuthDoneCallback,
  commonSignInResolvers,
} from '@backstage/plugin-auth-node';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';

const asgardeoAuthenticator = createOAuthAuthenticator({
  defaultProfileTransform:
    PassportOAuthAuthenticatorHelper.defaultProfileTransform,
  scopes: {
    required: ['openid', 'profile', 'email'],
  },
  initialize({ callbackUrl, config }) {
    const clientID = config.getString('clientId');
    const clientSecret = config.getString('clientSecret');
    const authorizationURL = config.getString('authorizationUrl');
    const tokenURL = config.getString('tokenUrl');

    return PassportOAuthAuthenticatorHelper.from(
      new OAuth2Strategy(
        {
          clientID,
          clientSecret,
          callbackURL: callbackUrl,
          authorizationURL,
          tokenURL,
          scope: ['openid', 'profile', 'email'],
        },
        (
          accessToken: string,
          _refreshToken: string,
          params: any,
          fullProfile: any,
          done: PassportOAuthDoneCallback,
        ) => {
          // refreshToken isn't part of the PassportOAuthResult type; omit it
          // or attach it to params if you need to preserve it.
          done(undefined, {
            fullProfile,
            accessToken,
            params,
          });
        },
      ),
    );
  },
  async start(input, helper) {
    return helper.start(input, {
      accessType: 'offline',
      prompt: 'consent',
    });
  },
  async authenticate(input, helper) {
    return helper.authenticate(input);
  },
  async refresh(input, helper) {
    return helper.refresh(input);
  },
});

export const authModuleAsgardeoProvider = createBackendModule({
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
            authenticator: asgardeoAuthenticator,
            signInResolverFactories: commonSignInResolvers,
          }),
        });
      },
    });
  },
});

export default authModuleAsgardeoProvider;
