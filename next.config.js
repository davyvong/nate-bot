/* eslint-disable @typescript-eslint/no-var-requires */

const loaderUtils = require('loader-utils');
const path = require('path');

const getLocalIdent = (context, localIdentName, localName) =>
  loaderUtils
    .getHashDigest(
      Buffer.from(
        `filePath:${path
          .relative(context.rootContext, context.resourcePath)
          .replace(/\\+/g, '/')}#className:${localName}`,
      ),
      'md4',
      'base64',
      6,
    )
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/^(-?\d|--)/, '_$1');

/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.discordapp.com',
        protocol: 'https',
      },
    ],
  },
  webpack: (config, context) => {
    const rules = config.module.rules
      .find(rule => typeof rule.oneOf === 'object')
      .oneOf.filter(rule => Array.isArray(rule.use));
    if (!context.dev) {
      rules.forEach(rule => {
        rule.use.forEach(moduleLoader => {
          if (moduleLoader.loader?.includes('css-loader') && !moduleLoader.loader?.includes('postcss-loader')) {
            moduleLoader.options = {
              ...moduleLoader.options,
              modules: {
                ...moduleLoader.options.modules,
                getLocalIdent,
              },
            };
          }
        });
      });
    }
    config.module.rules.push({
      loader: 'node-loader',
      test: /\.node$/,
    });
    config.module.rules.push({
      loader: '@svgr/webpack',
      options: {
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: { removeViewBox: false },
              },
            },
          ],
        },
      },
      test: /\.svg$/i,
    });
    return config;
  },
};

module.exports = nextConfig;
