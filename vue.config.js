const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  css: {
    extract: false
  },
  filenameHashing: false,
  // Disable sourcemaps for Figma
  productionSourceMap: false,
  chainWebpack: config => {
    // Disable generation of default index.html document
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    // Disable default code splitting
    config.optimization.delete('splitChunks');
    // Disable default entry point since we are using our own
    config.entryPoints.delete('app');
    // Encode svg assets as base64 for Figma since resources have to be embedded:
    // https://www.figma.com/plugin-docs/resource-links/
    // First, delete previous applied loaders
    config.module.rule('svg').uses.clear();
    config.module
      .rule('svg')
      .test(/\.svg$/)
      .use('url-loader')
      .loader('url-loader');
  },
  configureWebpack: {
    plugins: [
      new HtmlWebpackPlugin({
        template: './ui/index.html',
        filename: 'ui.html',
        inlineSource: '.(js)$',
        chunks: ['ui']
      }),
      new HtmlWebpackInlineSourcePlugin()
    ],
    entry: {
      ui: ['./ui/main.ts'],
      code: ['./plugin/index.ts']
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js'
    }
  },
  // Serve devServer to ui.hmtl instead of /index.html
  devServer: {
    index: 'ui.html'
  }
};
