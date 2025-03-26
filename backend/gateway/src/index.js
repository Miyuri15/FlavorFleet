const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Delivery Service - running on port 5001
app.use(
  "/api/deliveries",
  createProxyMiddleware({
    target: "http://delivery-service:5001",
    changeOrigin: true,
  })
);

// Order Service - running on port 5000
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: "http://order-service:5000",
    changeOrigin: true,
  })
);

// Payment Service - running on port 5002
app.use(
  "/api/payments",
  createProxyMiddleware({
    target: "http://payment-service:5002",
    changeOrigin: true,
  })
);

// Restaurant Service - running on port 5003
app.use(
  "/api/restaurants",
  createProxyMiddleware({
    target: "http://restaurant-service:5003",
    changeOrigin: true,
  })
);

// User Service - also running on port 5004
app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://user-service:5004",
    changeOrigin: true,
  })
);

app.listen(8000, () => {
  console.log("API Gateway is running at http://localhost:8000");
});
