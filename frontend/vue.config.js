module.exports = {
    lintOnSave: process.env.NODE_ENV !== 'production',
    configureWebpack: {
      entry: './src/index.js', // or './src/main.js' based on your project setup
      resolve: {
        fallback: {
          "zlib": require.resolve("browserify-zlib"),
          "querystring": require.resolve("querystring-es3"),
          "path": require.resolve("path-browserify"),
          "crypto": require.resolve("crypto-browserify"),
          "fs": false, // No browser equivalent for fs, set to false
          "stream": require.resolve("stream-browserify"),
          "http": require.resolve("stream-http"),
          "url": require.resolve("url/"),
          "assert": require.resolve('assert/'),
          "util": require.resolve('util/'),
          "vm": require.resolve('vm-browserify'), // Add vm-browserify
          "net": false, // set 'false' for modules not needed in the frontend
          "async_hooks": false // Disable async_hooks, as it's Node.js specific
        }
      }
    }
  };
  