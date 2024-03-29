const path = require("path");
const webpack = require("webpack");
const main = require("./src/config/main");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const devMode = process.env.NODE_ENV !== "production";

const BUILD_DIR = path.resolve(__dirname, "dist/public");
const STATIC_DIR = path.resolve(__dirname, "dist/public/static");
const APP_DIR = path.resolve(__dirname, "src/client/views");

const gitRevisionPlugin = new GitRevisionPlugin();

const protocol = main.https ? "https" : "http";

const config = {
  entry: {
    main: ["@babel/polyfill", APP_DIR + "/index.jsx"],
  },
  output: {
    publicPath: main.mode == "production" ? main.basename + "/" : "/",
    path: BUILD_DIR + "/",
    filename: devMode ? "js/bundle.js" : "js/[name].[hash].js",
    chunkFilename: "js/[id].js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {
      // react: "preact/compat",
      // "react-dom/test-utils": "preact/test-utils",
      // "react-dom": "preact/compat",
    },
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 50000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `npm.${packageName.replace("@", "")}`;
          },
          chunks: "all",
        },
      },
    },
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
    host: main.hostname,
    disableHostCheck: main.disableHostCheck,
    contentBase: BUILD_DIR,
    compress: true,
    port: main.client_port,
    proxy: {
      "/api/**": { target: main.apiUrl },
    },
  },
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: devMode ? "css/styles.css" : "css/[name].[hash].css",
      chunkFilename: "css/[id].css",
    }),
    new webpack.DefinePlugin({
      API_URL: JSON.stringify(main.apiUrl),
      BASENAME: JSON.stringify(main.basename),
      BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
      COMMIT_HASH: JSON.stringify(gitRevisionPlugin.commithash()),
      PAGES_URL: JSON.stringify(main.pagesUrl),
      GA_ID: JSON.stringify(main.ga_id),
      GDPR_URL: JSON.stringify(main.gdpr_url),
      GIT_VERSION: JSON.stringify(gitRevisionPlugin.version()),
      HOME: JSON.stringify(protocol + "://" + main.hostname),
      MESSAGE: JSON.stringify(main.message),
      TAXONOMY: JSON.stringify(main.taxonomy),
      SITENAME: JSON.stringify(main.siteName),
      VERSION: JSON.stringify(main.version),
      SUGGESTED_TERM: JSON.stringify(main.suggestedTerm),
      TREE_THRESHOLD: JSON.stringify(main.treeThreshold),
    }),
    new HtmlWebpackPlugin({
      hash: true,
      template: "./src/client/index.html",
      minify: {
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        preserveLineBreaks: true,
        minifyURLs: true,
        removeComments: false,
        removeAttributeQuotes: true,
      },
    }),
    new webpack.ExtendedAPIPlugin(),
  ].concat(
    main.pagesUrl.startsWith("http")
      ? []
      : [
          new CopyWebpackPlugin({
            patterns: [
              {
                from: "./src/client/favicon",
              },
              {
                from: main.pagesPath,
                to: STATIC_DIR,
              },
            ],
          }),
        ]
  ),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: APP_DIR,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.html$/,
        include: APP_DIR,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: {
                removeComments: false,
                collapseWhitespace: true,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
            options: { injectType: "singletonStyleTag" },
          },
          {
            loader: "css-loader",
            options: {
              modules: false,
            },
          },
        ],
        include: [
          /node_modules/,
          path.resolve(
            __dirname,
            "src/client/views/components/style/node_modules.css"
          ),
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: [
          /node_modules/,
          path.resolve(
            __dirname,
            "/src/client/views/components/style/node_modules.css"
          ),
        ],
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            query: {
              modules: {
                localIdentName: "[name]__[local]___[hash:base64:5]",
              },
              sourceMap: true,
              importLoaders: 2,
            },
          },
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.svg$/,
        use: ["svg-sprite-loader", "svgo-loader"],
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        loader: "file-loader",
        options: {
          name: "img/[hash].[ext]",
          publicPath: main.mode == "production" ? main.basename + "/" : "/",
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "fonts/[hash].[ext]",
            },
          },
        ],
      },
    ],
  },
};

module.exports = config;
