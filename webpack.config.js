const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = () => {
  const env = dotenv.config().parsed;

  // reduce it to a nice object, the same as before
  const envKeys = Object.keys(env).reduce((prev, next) => {
    if ( next === "VCAP_SERVICES" ) {
      let vcap_services = JSON.parse(env[next]) ;
      exposed_services = {};
      exposed_services["p-identity"] = vcap_services["p-identity"];
      prev[`process.env.${next}`] = JSON.stringify(JSON.stringify(exposed_services));
    } else {
      prev[`process.env.${next}`] = JSON.stringify(env[next]);
    }
    return prev;
  }, {});

  return {
    entry: './src/app.jsx',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    output: {
      path: __dirname + '/public',
      publicPath: '/',
      filename: 'bundle.js'
    },
    devServer: {
      contentBase: './public',
      hot: true
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./src/index.html",
        filename: "./index.html"
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin(envKeys)
    ]
  };
}
