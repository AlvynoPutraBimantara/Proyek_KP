const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());

app.use("/User", createProxyMiddleware({ target: "http://localhost:3002", changeOrigin: true }));
app.use("/SuratMasuk", createProxyMiddleware({ target: "http://localhost:3003", changeOrigin: true }));
app.use("/SuratKeluar", createProxyMiddleware({ target: "http://localhost:3004", changeOrigin: true }));
app.use("/uploads", createProxyMiddleware({ target: "http://localhost:3005", changeOrigin: true }));

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
