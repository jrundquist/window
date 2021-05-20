const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  mode: "production",
  entry: {
    app: {
      import: path.join(__dirname, "src/index.tsx"),
    }
  },
  output: {
    path: path.join(__dirname, "dist"),
    clean: true,
  },
  optimization: {
    splitChunks: {
    },
  },
  module: {
    rules: [
      {
        test: /\.(c|cpp)$/,
        use: [{
          loader: 'cpp-wasm-loader',
          options: {
            emccPath: 'emcc',
            emccFlags: [
              '-O2',
              '-s',
              'EXTRA_EXPORTED_RUNTIME_METHODS=[\'ccall\',\'cwrap\']',
              '-s',
              'MODULARIZE=1',
              '-s',
              'WASM=1',
              '-s',
              'EXPORT_NAME="MyModule"'
            ],
            memoryClass: true,
            fetchFiles: true,
            asmJs: false,
            wasm: true,
            fullEnv: false
          }
        }]
      },
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      }
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts", ".cpp", ".c"],
    alias: {
      "react-dom": "@hot-loader/react-dom",
    },
  },
  devServer: {
    contentBase: "./dist",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public", to: "." },
        { from: "node_modules/face-api.js-models/**/*", to: "models/[name][ext]"}
      ],
    }),
  ],
};

module.exports = config;