#!/usr/bin/env node
'use strict';

var execSync = require('child_process').execSync;
var path = require('path');
var fs = require('fs');

var configPath = path.join(__dirname, '../auth-config.json');

if (!fs.existsSync(configPath)) {
  console.error('❌ Missing auth-config.json. Please create it first.');
  process.exit(1);
}

var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
var provider = config.provider;

if (!provider) {
  console.error('❌ No provider defined in auth-config.json');
  process.exit(1);
}

// Build paths to provider scripts
var frontendScript = path.join(__dirname, 'frontend/' + provider + '.ts');
var backendScript = path.join(__dirname, 'backend/' + provider + '.ts');

try {
  console.log('⚙️  Setting up auth provider: ' + provider + '...');

  if (fs.existsSync(frontendScript)) {
    execSync('yarn ts-node ' + frontendScript, { stdio: 'inherit' });
  } else {
    console.warn('⚠️ No frontend script found for ' + provider);
  }

  if (fs.existsSync(backendScript)) {
    execSync('yarn ts-node ' + backendScript, { stdio: 'inherit' });
  } else {
    console.warn('⚠️ No backend script found for ' + provider);
  }

  console.log('✅ Auth setup completed for ' + provider);
} catch (err) {
  console.error('❌ Failed to run auth setup:', err.message);
  process.exit(1);
}
