import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthAuthenticator,
  PassportOAuthAuthenticatorHelper,
  PassportOAuthDoneCallback,
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
          refreshToken: string,
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
  async start(input, ctx) {
    // Get user info after authentication
    const userInfoURL = ctx.config.getString('userInfoUrl');
    const response = await fetch(userInfoURL, {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
    });
    const profile = await response.json();

    return {
      profile: {
        email: profile.email,
        displayName: profile.name || profile.username,
        picture: profile.picture,
      },
    };
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
          factory: asgardeoAuthenticator,
        });
      },
    });
  },
});

export default authModuleAsgardeoProvider;
