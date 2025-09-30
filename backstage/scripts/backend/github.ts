// scripts/backend/github.ts

const { readFileSync, writeFileSync } = require("fs");
const pathModule = require("path");

const backendIndex = pathModule.join(__dirname, "../../packages/backend/src/index.ts");

let content = readFileSync(backendIndex, "utf8");

if (!content.includes("plugin-auth-backend")) {
    content = `
import { createBackend } from '@backstage/backend-defaults';
import auth from '@backstage/plugin-auth-backend';
import github from '@backstage/plugin-auth-backend-module-github-provider';

${content}

const backend = createBackend();
backend.add(auth);
backend.add(github);
backend.start();
  `;
    writeFileSync(backendIndex, content, "utf8");
    console.log("✅ Backend index.ts updated for GitHub provider");
} else {
    console.log("ℹ️ Backend already configured for GitHub provider");
}
