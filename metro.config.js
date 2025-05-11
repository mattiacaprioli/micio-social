// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disabilita il supporto per il campo exports in package.json
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
