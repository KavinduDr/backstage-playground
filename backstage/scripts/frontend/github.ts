#!/usr/bin/env node


const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');


// --- Update app-config.yaml ---
const configPath = path.join(__dirname, '../../app-config.yaml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));


// Ensure auth.providers.github.development exists
config.auth = config.auth || {};
config.auth.environment = 'development';
config.auth.providers = config.auth.providers || {};
config.auth.providers.github = {
    development: {
        clientId: '${AUTH_GITHUB_CLIENT_ID}',
        clientSecret: '${AUTH_GITHUB_CLIENT_SECRET}',
        signIn: {
            resolvers: [
                { resolver: 'usernameMatchingUserEntityName' },
            ],
        },
    },
};


fs.writeFileSync(configPath, yaml.dump(config), 'utf8');
console.log('✅ app-config.yaml updated for GitHub provider');


// --- Update App.tsx ---
const appFilePath = path.join(__dirname, '../../packages/app/src/App.tsx');
let appCode = fs.readFileSync(appFilePath, 'utf8');


// Add imports if missing
if (!appCode.includes("githubAuthApiRef")) {
    appCode =
        "import { githubAuthApiRef } from '@backstage/core-plugin-api';\n" +
        "import { SignInPage } from '@backstage/core-components';\n" +
        appCode;
}


// Add SignInPage config if missing
if (!appCode.includes("github-auth-provider")) {
    const createAppRegex = /const app = createApp\(\{\s*components:\s*\{/;
    appCode = appCode.replace(createAppRegex, `const app = createApp({\n  components: {\n    SignInPage: props => (\n      <SignInPage\n        {...props}\n        auto\n        provider={{\n          id: 'github-auth-provider',\n          title: 'GitHub',\n          message: 'Sign in using GitHub',\n          apiRef: githubAuthApiRef,\n        }}\n      />\n    ),`);
}


fs.writeFileSync(appFilePath, appCode, 'utf8');
console.log('✅ App.tsx updated for GitHub provider');