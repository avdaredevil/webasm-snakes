import path from "path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import webpack from "webpack"
import WasmPackPlugin from "@wasm-tool/wasm-pack-plugin"
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin"
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./web/index.ts",
  output: {
    path: path.resolve(__dirname, "web-dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules\/(?!\@cruise\/(styles-ai|dag))/,
        use: [
          {
            loader: "ts-loader",
            options: { allowTsInNodeModules: true },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".graphql"],
    plugins: [
      // Automatically pick up "baseUrl" and "paths" from tsconfig.json
      // @ts-ignore https://github.com/dividab/tsconfig-paths-webpack-plugin/issues/69
      new TsconfigPathsPlugin(),
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: "Snake Game",
    }),
    new WasmPackPlugin({
      crateDirectory: path.join(path.resolve(__dirname, "."), 'backend'),
      extraArgs: "--target=web",
    }),
    // Have this example work in Edge which doesn't ship `TextEncoder` or
    // `TextDecoder` at this time.
    new webpack.ProvidePlugin({
      TextDecoder: ["text-encoding", "TextDecoder"],
      TextEncoder: ["text-encoding", "TextEncoder"],
    }),
  ],
  experiments: {
    asyncWebAssembly: true
  },
  mode: "development",
};
