const Order = require("../models/orderModel");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const notificationService = require("../utils/notificationService");

const OrderService = {
  async createOrder(orderData) {
    try {
      const order = new Order(orderData);
      await order.save();

      // Notify admin (existing functionality)
      await this.notifyAdmin(order);

      // New: Notify user about order placement
      await notificationService.sendNotification(
        order.userId,
        `Your order #${order._id} has been placed successfully!`,
        "order_placed",
        {
          sendEmail: true,
          emailSubject: "Order Placed Successfully",
          relatedEntity: { type: "Order", id: order._id },
        }
      );

      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order");
    }
  },

  async getOrderById(orderId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error("Invalid order ID format");
      }

      return await Order.findById(orderId)
        .populate("userId", "name email phone")
        .populate("restaurantId", "name address phone")
        .populate("deliveryAgentId", "name phone")
        .populate("items.itemId", "name");
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new Error("Failed to fetch order");
    }
  },

  async getOrdersByUser(userId) {
    try {
      return await Order.find({ userId })
        .populate("restaurantId", "name")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch user orders");
    }
  },

  async getOrdersByRestaurant(restaurantId) {
    try {
      const orders = await Order.find({ restaurantId })
        .populate("userId", "name phone email")
        .sort({ createdAt: -1 })
        .lean();

      return orders.map((order) => ({
        ...order,
        orderId: order._id,
        customerName: order.userId?.name || "Guest",
        customerPhone: order.userId?.phone || "N/A",
        customerEmail: order.userId?.email || "N/A",
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  },

  async getOrdersByDeliveryAgent(deliveryAgentId) {
    try {
      return await Order.find({ deliveryAgentId })
        .populate("userId", "name phone")
        .populate("restaurantId", "name address")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error fetching delivery agent orders:", error);
      throw new Error("Failed to fetch delivery agent orders");
    }
  },

  async updateOrderStatus(orderId, newStatus, userId, userRole, notes = "") {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error("Order not found");

      this.validateStatusTransition(order.status, newStatus, userRole);

      order.status = newStatus;
      order.updatedAt = new Date();

      if (
        (userRole === "admin" || userRole === "delivery") &&
        newStatus === "Confirmed"
      ) {
        order.deliveryAgentId = userId;
      }
      if (notes) {
        if (userRole === "admin") {
          order.adminNotes = notes;
        } else if (userRole === "restaurant") {
          order.specialInstructions = notes;
        }
      }

      await order.save();
      await this.sendStatusNotifications(order, newStatus, userRole);

      return order;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  },

  validateStatusTransition(currentStatus, newStatus, userRole) {
    const validTransitions = {
      admin: {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Cancelled"],
      },
      restaurant: {
        Confirmed: ["Preparing", "Cancelled"],
        Preparing: ["Prepared", "Cancelled"],
        Prepared: ["Cancelled"],
      },
      restaurant_owner: {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Preparing", "Cancelled"],
        Preparing: ["Prepared", "Cancelled"],
        Prepared: ["Cancelled"],
      },
      delivery: {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Out for Delivery", "Cancelled"],
        "Out for Delivery": ["Delivered", "Cancelled"],
      },
      user: {
        Pending: ["Cancelled"],
      },
    };

    if (
      !validTransitions[userRole] ||
      !validTransitions[userRole][currentStatus] ||
      !validTransitions[userRole][currentStatus].includes(newStatus)
    ) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus} for role ${userRole}`
      );
    }
  },

  async sendStatusNotifications(order, newStatus, userRole) {
    const notificationConfigs = {
      Pending: {
        message: `Your order #${order._id} has been placed successfully! We'll notify you when it's confirmed.`,
        type: "order_placed",
        sendEmail: true,
        emailSubject: "Order Placed Successfully",
      },
      Confirmed: {
        message: `Your order #${order._id} has been confirmed and is being processed.`,
        restaurantMessage: `New order #${order._id} has been confirmed (Total: $${order.totalAmount})`,
        type: "order_confirmed",
        sendEmail: true,
        emailSubject: "Order Confirmed",
      },
      Preparing: {
        message: `Restaurant has started preparing your order #${order._id}`,
        type: "order_preparing",
        sendEmail: true,
        emailSubject: "Order Being Prepared",
      },
      Prepared: {
        message: `Order #${order._id} is ready for pickup`,
        type: "order_ready",
        sendEmail: true,
        emailSubject: "Order Ready for Pickup",
      },
      "Out for Delivery": {
        message: `Your order #${order._id} is on its way!`,
        type: "order_out_for_delivery",
        sendEmail: true,
        emailSubject: "Order On The Way",
      },
      Delivered: {
        message: `Order #${order._id} has been delivered. Enjoy your meal!`,
        restaurantMessage: `Order #${order._id} has been delivered to customer`,
        type: "order_delivered",
        sendEmail: true,
        emailSubject: "Order Delivered",
      },
      Cancelled: {
        message: `Order #${order._id} has been cancelled${
          order.cancellationReason ? `: ${order.cancellationReason}` : ""
        }`,
        type: "order_cancelled",
        sendEmail: true,
        emailSubject: "Order Cancelled",
      },
    };

    const config = notificationConfigs[newStatus];
    if (!config) return;

    try {
      // Send to user for all statuses except Prepared (which goes to delivery agent)
      if (newStatus !== "Prepared") {
        await notificationService.sendNotification(
          order.userId,
          config.message,
          config.type,
          {
            sendEmail: config.sendEmail,
            emailSubject: config.emailSubject,
            relatedEntity: { type: "Order", id: order._id },
          }
        );
      }

      if (["Confirmed", "Delivered"].includes(newStatus)) {
        await notificationService.notifyRestaurant(
          order.restaurantId,
          config.restaurantMessage || config.message,
          {
            sendEmail: config.sendEmail,
            emailSubject: config.emailSubject,
            relatedEntity: { type: "Order", id: order._id },
          }
        );
      }

      if (
        ["Prepared", "Out for Delivery", "Delivered"].includes(newStatus) &&
        order.deliveryAgentId
      ) {
        await notificationService.sendNotification(
          order.deliveryAgentId,
          config.message,
          config.type,
          {
            sendEmail: config.sendEmail,
            emailSubject: config.emailSubject,
            relatedEntity: { type: "Order", id: order._id },
          }
        );
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  },

  async notifyAdmin(order) {
    try {
      await notificationService.notifyAdmin(
        `New order #${order._id} received from ${order.userId}. Total: $${order.totalAmount}`,
        {
          sendEmail: true,
          emailSubject: "New Order Requires Attention",
          relatedEntity: { type: "Order", id: order._id },
        }
      );
    } catch (error) {
      console.error("Error notifying admin:", error);
    }
  },

  async cancelOrder(orderId, userId, reason) {
    try {
      const order = await Order.findById(orderId);
      if (!order) throw new Error("Order not found");

      if (
        order.userId.toString() !== userId.toString() &&
        order.status !== "Pending"
      ) {
        throw new Error("Only pending orders can be cancelled by non-owners");
      }

      order.status = "Cancelled";
      order.cancellationReason = reason;
      order.updatedAt = new Date();
      await order.save();

      await this.sendStatusNotifications(order, "Cancelled");
      return order;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  },

  async getOrderForTracking(orderId) {
    if (!orderId || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new AppError("Invalid order ID format", 400);
    }

    const order = await Order.findById(orderId)
      .populate("restaurantId", "name address phone")
      .populate("deliveryAgentId", "name phone vehicleType")
      .lean();

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (!order.estimatedDeliveryTime) {
      const statusTimestamp =
        order.status === "Pending" ? order.createdAt : order.updatedAt;

      order.estimatedDeliveryTime = this.calculateEstimatedDelivery(
        statusTimestamp,
        order.status
      );
    }

    return {
      ...order,
      currentStatus: order.status,
      statusHistory: this.generateStatusHistory(order),
    };
  },

  calculateEstimatedDelivery(timestamp, status) {
    const statusDurations = {
      Pending: 15,
      Confirmed: 15,
      Preparing: 30,
      Prepared: 15,
      "Out for Delivery": 30,
    };

    const statusFlow = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Prepared",
      "Out for Delivery",
    ];
    let totalMinutes = 0;
    const currentIndex = statusFlow.indexOf(status);

    if (currentIndex !== -1) {
      for (let i = currentIndex; i < statusFlow.length; i++) {
        totalMinutes += statusDurations[statusFlow[i]] || 0;
      }
    } else {
      totalMinutes = 60;
    }

    const deliveryTime = new Date(timestamp);
    deliveryTime.setMinutes(deliveryTime.getMinutes() + totalMinutes);
    return deliveryTime;
  },

  generateStatusHistory(order) {
    const statusFlow = [
      "Pending",
      "Confirmed",
      "Preparing",
      "Prepared",
      "Out for Delivery",
      "Delivered",
    ];
    const currentIndex = statusFlow.indexOf(order.status);

    return statusFlow.map((status, index) => ({
      status,
      completed: index < currentIndex,
      current: index === currentIndex,
      timestamp:
        index === 0
          ? order.createdAt
          : index <= currentIndex
          ? order.updatedAt
          : null,
    }));
  },

  async getDeliveryIncomingOrders(deliveryAgentId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(deliveryAgentId)) {
        throw new Error("Invalid delivery agent ID");
      }

      const agent = await User.findById(deliveryAgentId).lean();
      if (!agent || agent.role !== "delivery") {
        throw new Error("Delivery agent not found");
      }

      // Use the single preferredRoute string
      const route = agent.preferredRoute || "";

      // Create search pattern from the single route
      const searchPattern = route ? new RegExp(route, "i") : /.*/;

      const query = {
        $or: [
          {
            status: "Pending",
            deliveryAddress: searchPattern,
            deliveryAgentId: null,
          },
          {
            deliveryAgentId: new mongoose.Types.ObjectId(deliveryAgentId),
            status: { $in: ["Confirmed", "Out for Delivery"] },
          },
        ],
      };

      return await Order.find(query)
        .populate("restaurantId", "name address")
        .populate("userId", "name phone")
        .populate("deliveryAgentId", "firstName lastName contactNumber")
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in getDeliveryIncomingOrders:", error);
      throw new Error(error.message || "Failed to fetch orders");
    }
  },

  async getUserOrdersCount(userId) {
    try {
      const counts = await Order.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0],
              },
            },
            canceled: {
              $sum: {
                $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0],
              },
            },
            pending: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      [
                        "Pending",
                        "Confirmed",
                        "Preparing",
                        "Prepared",
                        "Out for Delivery",
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      return counts.length > 0
        ? counts[0]
        : {
            total: 0,
            delivered: 0,
            canceled: 0,
            pending: 0,
          };
    } catch (error) {
      console.error("Error in orderService.getUserOrdersCount:", error);
      throw error;
    }
  },

  // RATING RELATED SERVICES
  async submitRating(orderId, ratingData) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "Delivered") {
      throw new AppError("Only delivered orders can be rated", 400);
    }

    if (order.hasRated) {
      throw new AppError("Order has already been rated", 400);
    }

    // Create rating object
    const rating = {
      restaurantRating: ratingData.restaurantRating,
      deliveryRating: ratingData.deliveryRating,
      itemRatings: ratingData.itemRatings.map((item) => ({
        itemId: item.itemId,
        rating: item.rating,
      })),
      feedback: ratingData.feedback,
      ratedAt: new Date(),
    };

    // Update order with rating
    order.rating = rating;
    order.hasRated = true;
    await order.save();

    // Update all related ratings
    await this.updateRestaurantRating(
      order.restaurantId,
      ratingData.restaurantRating
    );

    if (order.deliveryAgentId) {
      await this.updateDeliveryAgentRating(
        order.deliveryAgentId,
        ratingData.deliveryRating
      );
    }

    // Add this to update menu item ratings
    await this.updateMenuItemRatings(ratingData.itemRatings);

    return order;
  },

  async updateRestaurantRating(restaurantId, newRating) {
    try {
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) return;

      const totalRatings = restaurant.ratingCount || 0;
      const currentAvg = restaurant.averageRating || 0;
      const newAvg =
        (currentAvg * totalRatings + newRating) / (totalRatings + 1);

      restaurant.averageRating = parseFloat(newAvg.toFixed(2));
      restaurant.ratingCount = totalRatings + 1;
      await restaurant.save();
    } catch (error) {
      console.error("Error updating restaurant rating:", error);
      throw new Error("Failed to update restaurant rating");
    }
  },

  async updateMenuItemRatings(itemRatings) {
    try {
      // Use bulk operations for better performance
      const bulkOps = itemRatings.map((itemRating) => ({
        updateOne: {
          filter: { _id: itemRating.itemId },
          update: {
            $inc: {
              ratingCount: 1,
              ratingSum: itemRating.rating,
            },
          },
        },
      }));

      // Execute bulk operation
      await MenuItem.bulkWrite(bulkOps);

      // Now update averages for all affected menu items
      const itemIds = itemRatings.map((item) => item.itemId);
      const items = await MenuItem.find({ _id: { $in: itemIds } });

      for (const item of items) {
        // Calculate new average if we have both sum and count
        if (item.ratingSum && item.ratingCount) {
          item.averageRating = parseFloat(
            (item.ratingSum / item.ratingCount).toFixed(2)
          );
          await item.save();
        }
      }
    } catch (error) {
      console.error("Error updating menu item ratings:", error);
      throw new Error("Failed to update menu item ratings");
    }
  },

  async updateDeliveryAgentRating(deliveryAgentId, newRating) {
    try {
      const agent = await User.findById(deliveryAgentId);
      if (!agent || agent.role !== "delivery") return;

      const totalRatings = agent.deliveryRatingCount || 0;
      const currentAvg = agent.deliveryRating || 0;
      const newAvg =
        (currentAvg * totalRatings + newRating) / (totalRatings + 1);

      agent.deliveryRating = parseFloat(newAvg.toFixed(2));
      agent.deliveryRatingCount = totalRatings + 1;
      await agent.save();
    } catch (error) {
      console.error("Error updating delivery agent rating:", error);
      throw new Error("Failed to update delivery agent rating");
    }
  },

  async getRestaurantRatings(restaurantId) {
    const orders = await Order.find({
      restaurantId,
      hasRated: true,
    })
      .select("rating createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return orders.map((order) => ({
      rating: order.rating,
      date: order.createdAt,
    }));
  },

  async assignDeliveryAgent(orderId, driverId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      order.deliveryAgentId = driverId;
      order.status = "Out for Delivery";
      order.updatedAt = new Date();

      await order.save();

      await notificationService.sendNotification(
        driverId,
        `You have been assigned to deliver order #${order._id}.`,
        "order_assigned",
        {
          sendEmail: true,
          emailSubject: "New Delivery Assignment",
          relatedEntity: { type: "Order", id: order._id },
        }
      );

      return order;
    } catch (error) {
      console.error("Error assigning delivery agent:", error);
      throw new Error("Failed to assign delivery agent");
    }
  },
};

module.exports = OrderService;
