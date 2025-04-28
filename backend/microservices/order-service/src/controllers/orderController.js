const Order = require("../models/orderModel");
const OrderService = require("../services/orderService");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const RestaurantService = require("../services/restaurantService");
const DeliveryService = require("../services/deliveryService");
const NotificationService = require("../utils/notificationService");

const OrderController = {
  async createOrder(req, res) {
    try {
      const {
        restaurantId,
        items,
        totalAmount,
        deliveryAddress,
        paymentMethod,
      } = req.body;
      const userId = req.user.id;

      let restaurantDetails = null;

      try {
        const restaurant = await RestaurantService.getRestaurantById(
          restaurantId
        );

        if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
        }

        const { address } = restaurant;

        if (!address || !address.coordinates) {
          return res
            .status(400)
            .json({ message: "Restaurant address or coordinates missing" });
        }

        const { lat, lng } = address.coordinates;

        if (lat == null || lng == null) {
          return res
            .status(400)
            .json({ message: "Restaurant coordinates incomplete" });
        }

        restaurantDetails = {
          name: restaurant.name,
          address: {
            street: address.street || "",
            city: address.city || "",
            postalCode: address.postalCode || "",
            coordinates: {
              type: "Point",
              coordinates: [lng, lat], // GeoJSON format
            },
          },
        };
      } catch (error) {
        console.error("Failed to fetch restaurant info:", error.message);
        return res
          .status(500)
          .json({ message: "Failed to fetch restaurant information" });
      }

      const newOrder = new Order({
        userId,
        restaurantId,
        restaurantDetails,
        items,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        status: "Pending",
      });

      await newOrder.save();

      // Send response immediately
      res.status(201).json(newOrder);

      // Notify user (this happens after response is sent)
      try {
        await OrderService.sendStatusNotifications(newOrder, "Pending", "user");
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
        // Don't fail the request if notifications fail
      }
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  async getOrder(req, res) {
    try {
      res.setHeader("Content-Type", "application/json");

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          error: "Invalid order ID format",
          receivedId: req.params.id,
        });
      }

      const order = await Order.findById(req.params.id)
        .populate("userId", "name email")
        .populate("restaurantId", "name address")
        .populate("deliveryAgentId", "name phone")
        .lean();

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const currentUserId = req.user.id.toString();
      if (
        req.user.role !== "admin" &&
        currentUserId !== order.userId._id.toString() &&
        currentUserId !== order.deliveryAgentId?._id?.toString()
      ) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Order fetch error:", error);
      return res.status(500).json({
        error: "Server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  async getUserOrders(req, res) {
    try {
      const orders = await OrderService.getOrdersByUser(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getRestaurantOrders(req, res) {
    try {
      if (!["restaurant", "restaurant_owner"].includes(req.user.role)) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res
          .status(400)
          .json({ error: "Missing restaurantId query parameter" });
      }

      const orders = await OrderService.getOrdersByRestaurant(restaurantId);

      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getDeliveryAgentOrders(req, res) {
    try {
      const orders = await OrderService.getOrdersByDeliveryAgent(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status, notes } = req.body;
      const order = await OrderService.updateOrderStatus(
        req.params.id,
        status,
        req.user.id,
        req.user.role,
        notes
      );

      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async cancelOrder(req, res) {
    try {
      const order = await OrderService.cancelOrder(
        req.params.id,
        req.user.id,
        req.body.reason
      );

      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  trackOrder: catchAsync(async (req, res, next) => {
    const order = await OrderService.getOrderForTracking(req.params.id);
    res.status(200).json({
      status: "success",
      data: { order },
    });
  }),

  getOrderUpdates: catchAsync(async (req, res, next) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendUpdate = async () => {
      try {
        const order = await OrderService.getOrderForTracking(req.params.id);
        res.write(
          `data: ${JSON.stringify({
            status: "success",
            data: {
              currentStatus: order.currentStatus,
              estimatedDelivery: order.estimatedDelivery,
            },
          })}\n\n`
        );
      } catch (err) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            status: "error",
            message: err.message,
          })}\n\n`
        );
        res.end();
      }
    };

    await sendUpdate();
    const interval = setInterval(sendUpdate, 15000);
    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  }),

  async getDeliveryIncoming(req, res) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const orders = await OrderService.getDeliveryIncomingOrders(req.user.id);
      return res.status(orders.length ? 200 : 204).json(orders);
    } catch (error) {
      console.error("Controller error:", error);
      const statusCode = error.message.includes("not found") ? 404 : 500;
      return res.status(statusCode).json({
        error: error.message || "Internal server error",
      });
    }
  },

  getNearbyOrders: catchAsync(async (req, res, next) => {
    const driverId = req.user.id;

    const driver = await DeliveryService.getDriverById(driverId);

    if (!driver) {
      return next(new AppError("Driver not found", 404));
    }

    const [lng, lat] = driver.currentLocation.coordinates;

    const nearbyOrders = await OrderService.findNearbyPreparedOrders(lat, lng);

    res.status(200).json({
      status: "success",
      data: nearbyOrders,
    });
  }),

  getUserOrdersCount: catchAsync(async (req, res) => {
    try {
      if (!req.user?.id) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required",
        });
      }

      const counts = await OrderService.getUserOrdersCount(req.user.id);
      res.status(200).json({
        status: "success",
        data: {
          total: counts.total,
          delivered: counts.delivered,
          canceled: counts.canceled,
          pending: counts.pending,
        },
      });
    } catch (error) {
      console.error("Error in OrderController.getUserOrdersCount:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to get order counts",
      });
    }
  }),

  // RATING RELATED CONTROLLERS
  submitRating: catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { restaurantRating, deliveryRating, itemRatings, feedback } =
      req.body;
    const userId = req.user.id;

    if (!restaurantRating || !deliveryRating) {
      return next(
        new AppError("Restaurant and delivery ratings are required", 400)
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.userId.toString() !== userId.toString()) {
      return next(new AppError("Unauthorized to rate this order", 403));
    }

    if (order.status !== "Delivered") {
      return next(new AppError("Only delivered orders can be rated", 400));
    }

    if (order.hasRated) {
      return next(new AppError("Order has already been rated", 400));
    }

    const updatedOrder = await OrderService.submitRating(orderId, {
      restaurantRating,
      deliveryRating,
      itemRatings,
      feedback,
    });

    res.status(200).json({
      status: "success",
      data: {
        order: updatedOrder,
      },
    });
  }),

  getOrderRatings: catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .select("rating hasRated")
      .lean();

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        hasRated: order.hasRated,
        rating: order.rating || null,
      },
    });
  }),

  getRestaurantRatings: catchAsync(async (req, res, next) => {
    const { restaurantId } = req.params;

    const ratings = await OrderService.getRestaurantRatings(restaurantId);

    res.status(200).json({
      status: "success",
      data: {
        ratings,
      },
    });
  }),

  notifyNearbyDeliveryAgents: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const orderId = id;
    const { restaurantId } = req.body;

    const restaurant = await RestaurantService.getRestaurantById(restaurantId);

    if (!restaurant) {
      return next(new AppError("Restaurant not found", 404));
    }

    if (
      !restaurant.address ||
      !restaurant.address.coordinates ||
      restaurant.address.coordinates.lat == null ||
      restaurant.address.coordinates.lng == null
    ) {
      return next(new AppError("Restaurant coordinates not found", 400));
    }

    const { lat, lng } = restaurant.address.coordinates;

    const nearbyAgents = await DeliveryService.findNearbyDeliveryAgents(
      lat,
      lng
    );

    if (!nearbyAgents.length) {
      return next(new AppError("No delivery agents available nearby", 404));
    }

    await Promise.all(
      nearbyAgents.map(async (agent) => {
        await NotificationService.sendNotification(
          agent.driverId,
          `New delivery available for order #${orderId}. Accept quickly!`,
          "new_delivery_available",
          {
            sendEmail: true,
            emailSubject: "New Delivery Opportunity",
            relatedEntity: { type: "Order", id: orderId },
          }
        );
      })
    );

    res.status(200).json({
      status: "success",
      message: "Nearby delivery agents have been notified about the order.",
    });
  }),

  acceptDelivery: catchAsync(async (req, res, next) => {
    const { id } = req.params; // orderId
    const driverId = req.user.id; // assuming the agent is authenticated

    const order = await Order.findById(id);

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    if (order.deliveryAgentId) {
      return next(new AppError("Order already accepted by another agent", 400));
    }

    order.deliveryAgentId = driverId;
    order.status = "Out for Delivery";
    order.updatedAt = new Date();
    await order.save();

    await NotificationService.sendNotification(
      driverId,
      `You have successfully accepted the delivery for order #${order._id}.`,
      "delivery_accepted",
      {
        sendEmail: true,
        emailSubject: "Delivery Accepted",
        relatedEntity: { type: "Order", id: order._id },
      }
    );

    res.status(200).json({
      status: "success",
      message: "You have accepted the delivery successfully",
      data: { order },
    });
  }),
};

module.exports = OrderController;
