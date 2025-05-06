const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const deliveryRoutes = require("./routes/deliveryRoutes");
const driverRoutes = require("./routes/driverRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Extract driverId from handshake query
  const driverId = socket.handshake.query.driverId;
  if (driverId) {
    console.log(`Driver ${driverId} connected`);

    // Join a room specific to this driver
    socket.join(`driver_${driverId}`);

    // You could also join an admin room for monitoring
    socket.join("admin_monitoring");
  }

  // Handle location updates from drivers
  socket.on("locationUpdate", (data) => {
    console.log(
      `Location update from driver ${data.driverId}:`,
      data.lat,
      data.lng
    );

    // Broadcast to admin dashboard
    io.to("admin_monitoring").emit("driverLocation", data);

    // You could also store this in your database
    // await Driver.updateLocation(data.driverId, data.lat, data.lng);
  });

  // Handle delivery status updates
  socket.on("deliveryStatusUpdate", (data) => {
    console.log(`Delivery status update: ${data.orderId} - ${data.status}`);
    // Broadcast to relevant parties (customer, restaurant, etc.)
    io.to(`order_${data.orderId}`).emit("deliveryUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (driverId) {
      console.log(`Driver ${driverId} disconnected`);
      // You might want to update driver status in DB
    }
  });
});

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to FlavorFleet delivery-service with WebSocket support!");
});

app.use("/api/deliveries", deliveryRoutes);
app.use("/api/drivers", driverRoutes);

server.listen(PORT, () => {
  console.log(`Server running on Port:${PORT} with WebSocket support`);
});

app.set("io", io);
