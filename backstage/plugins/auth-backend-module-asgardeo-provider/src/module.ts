import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  authProvidersExtensionPoint,
  createOAuthAuthenticator,
  createOAuthProviderFactory,
  PassportOAuthAuthenticatorHelper,
  PassportOAuthDoneCallback,
} from '@backstage/plugin-auth-node';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { stringifyEntityRef, DEFAULT_NAMESPACE } from '@backstage/catalog-model';

const asgardeoAuthenticator = createOAuthAuthenticator({
  defaultProfileTransform:
    PassportOAuthAuthenticatorHelper.defaultProfileTransform,
  scopes: {
    required: ['openid', 'profile', 'email'],
  },
  initialize({ callbackUrl, config }) {
    console.log('🔧 Initializing Asgardeo authenticator...');
    console.log('📍 Callback URL:', callbackUrl);

    const clientID = config.getString('clientId');
    const clientSecret = config.getString('clientSecret');
    const authorizationURL = config.getString('authorizationUrl');
    const tokenURL = config.getString('tokenUrl');
    const userInfoURL = config.getString('userInfoUrl');

    console.log('⚙️  Config loaded:', {
      clientID: clientID.substring(0, 10) + '...',
      authorizationURL,
      tokenURL,
      userInfoURL,
    });

    const strategy = new OAuth2Strategy(
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
        console.log('🎫 OAuth callback received');
        console.log('✅ Access token received:', accessToken ? 'Yes' : 'No');
        console.log('🔄 Refresh token received:', refreshToken ? 'Yes' : 'No');
        console.log('📦 Params:', params);

        done(undefined, {
          fullProfile,
          accessToken,
          params,
        });
      },
    );

    // Override userProfile to fetch from Asgardeo's userinfo endpoint with proper headers
    strategy.userProfile = async function (accessToken: string, done: any) {
      console.log('👤 Fetching user profile from:', userInfoURL);
      console.log('🔑 Using access token:', accessToken.substring(0, 20) + '...');

      try {
        // Use fetch instead of OAuth2's get method for better control over headers
        const response = await fetch(userInfoURL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          throw new Error(`Failed to fetch user profile: ${response.status} ${errorText}`);
        }

        const profile = await response.json();
        console.log('📋 Parsed profile:', profile);

        // Transform Asgardeo profile to Passport format
        const passportProfile = {
          provider: 'asgardeo',
          id: profile.sub,
          displayName: profile.name || profile.username || profile.email,
          username: profile.username || profile.email?.split('@')[0],
          emails: profile.email ? [{ value: profile.email }] : [],
          email: profile.email,
          name: {
            familyName: profile.family_name,
            givenName: profile.given_name,
          },
          _raw: JSON.stringify(profile),
          _json: profile,
        };

        console.log('✨ Transformed profile:', {
          id: passportProfile.id,
          displayName: passportProfile.displayName,
          email: passportProfile.email,
          username: passportProfile.username,
        });

        done(null, passportProfile);
      } catch (error) {
        console.error('❌ Error fetching user profile:', error);
        done(error);
      }
    };

    return PassportOAuthAuthenticatorHelper.from(strategy);
  },
  async start(input, helper) {
    console.log('🚀 Starting OAuth flow...');
    const result = await helper.start(input, {
      accessType: 'offline',
      prompt: 'consent',
    });
    console.log('✅ OAuth flow started successfully');
    return result;
  },
  async authenticate(input, helper) {
    console.log('🔐 Authenticating user...');
    try {
      const result = await helper.authenticate(input);
      console.log('✅ Authentication successful');
      console.log('👤 Authenticated profile:', result.fullProfile);
      return result;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  },
  async refresh(input, helper) {
    console.log('🔄 Refreshing session...');
    console.log('📥 Refresh input:', {
      hasRefreshToken: !!input.refreshToken,
      scope: input.scope,
    });

    try {
      const result = await helper.refresh(input);
      console.log('✅ Session refreshed successfully');
      return result;
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      throw error;
    }
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
        console.log('🎯 Registering Asgardeo auth provider...');

        providers.registerProvider({
          providerId: 'asgardeo',
          factory: createOAuthProviderFactory({
            authenticator: asgardeoAuthenticator,
            signInResolver: async (info, ctx) => {
              console.log('🔍 Resolving sign-in...');
              console.log('📋 Profile info received:', JSON.stringify(info.profile, null, 2));

              const { profile } = info;

              // Check for email in different possible locations
              const email =
                profile.email || "" || null;

              console.log('📧 Email extracted:', email);

              if (!email) {
                console.error('❌ No email found in profile');
                console.error('📋 Full profile:', JSON.stringify(profile, null, 2));
                throw new Error(
                  `User profile does not contain an email. Profile: ${JSON.stringify(profile)}`
                );
              }

              // Create user entity reference from email
              const username = email.split('@')[0];
              const userEntityRef = stringifyEntityRef({
                kind: 'User',
                name: username,
                namespace: DEFAULT_NAMESPACE,
              });

              console.log('👤 User entity ref:', userEntityRef);
              console.log('🔍 Attempting to sign in with catalog user...');

              try {
                const signInResult = await ctx.signInWithCatalogUser({
                  entityRef: userEntityRef,
                });
                console.log('✅ Sign-in successful:', signInResult);
                return signInResult;
              } catch (error) {
                console.error('❌ Sign-in with catalog user failed:', error);
                console.error('💡 Make sure a User entity exists in the catalog with name:', username);
                throw error;
              }
            },
          }),
        });

        console.log('✅ Asgardeo provider registered successfully');
      },
    });
  },
});

export default authModuleAsgardeoProvider;
