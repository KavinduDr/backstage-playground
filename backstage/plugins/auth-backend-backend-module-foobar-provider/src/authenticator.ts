import { Strategy as ProviderStrategy } from 'passport-openidconnect';
import {
    createOAuthAuthenticator,
    PassportOAuthAuthenticatorHelper,
    PassportOAuthDoneCallback,
    PassportProfile,
} from '@backstage/plugin-auth-node';

/** @public */
export const providerAuthenticator = createOAuthAuthenticator({
    defaultProfileTransform:
        PassportOAuthAuthenticatorHelper.defaultProfileTransform,
    scopes: {
        // Scopes required by the provider
        required: ['openid', 'email', 'profile', 'offline_access'],
    },
    initialize({ callbackUrl, config }) {

        return PassportOAuthAuthenticatorHelper.from(
            new ProviderStrategy(
                {
                    clientID: config.getString('clientId'),
                    clientSecret: config.getString('clientSecret'),
                    issuer: config.getString('issuer'),
                    authorizationURL: config.getString('authorizationUrl'),
                    tokenURL: config.getString('tokenUrl'),
                    callbackURL: callbackUrl,
                    userInfoURL: config.getString('userInfoUrl'),
                    scope: config.getStringArray('scopes').join(' '),
                },
                (
                    _issuer: string,
                    profile: PassportProfile,
                    done: PassportOAuthDoneCallback,
                ) => {
                    done(
                        undefined,
                        { fullProfile: profile, params: { scope: 'openid email profile', expires_in: 3600 }, accessToken: '' },
                        { refreshToken: '' },
                    );
                },
            ),
        );
    },

    async start(input, helper) {
        return helper.start(input, {});
    },

    async authenticate(input, helper) {
        return helper.authenticate(input);
    },

    async refresh(input, helper) {
        return helper.refresh(input);
    },
});