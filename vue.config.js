const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Path = require('path');

module.exports = {
  css: {
    extract: false
  },
  filenameHashing: false,
  chainWebpack: config => {
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.optimization.delete('splitChunks');
    config.entryPoints.delete('app');
  },
  configureWebpack: {
    plugins: [
      new HtmlWebpackPlugin({
        template: './ui/ui.html',
        filename: 'ui.html',
        inlineSource: '.(js)$',
        chunks: ['ui']
      }),
      new HtmlWebpackInlineSourcePlugin(),
      new CopyPlugin([{ from: 'plugin/manifest.json', to: 'manifest.json' }])
    ],
    entry: {
      ui: ['./ui/main.ts'],
      code: ['./plugin/index.ts']
    },
    resolve: {
      alias: {
        '@': Path.resolve('./ui')
      }
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js'
    }
  },
  productionSourceMap: false
  // For Figma
};
