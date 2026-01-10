import { OrderManagement } from "../models/OrderManagement.js";

export const getAllOrders = async (req, res) => {
  try {
    console.log('📦 getAllOrders called');
    console.log('🔐 User:', req.user);
    console.log('📋 Query params:', req.query);
    
    const { status, userId, paymentMethod, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (userId) filters.userId = userId;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    console.log('🔍 Filters:', filters);

    const result = await OrderManagement.getAllOrders(filters, parseInt(page), parseInt(limit));

    console.log('✅ Orders retrieved:', result.total, 'total orders');
    console.log('📊 Page:', result.page, 'of', result.pages);
    console.log('📝 Sample order ID:', result.orders[0]?._id);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ getAllOrders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log('🔄 updateOrderStatus controller:', { orderId, status, bodyKeys: Object.keys(req.body) });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const order = await OrderManagement.updateOrderStatus(orderId, status);

    if (!order) {
      console.error('❌ Order not found for ID:', orderId);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log('✅ Order status updated successfully');
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
  } catch (error) {
    console.error('❌ updateOrderStatus error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTrackingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber, carrier, trackingUrl, estimatedDelivery } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "Tracking number is required"
      });
    }

    const order = await OrderManagement.updateTrackingInfo(orderId, {
      trackingNumber,
      carrier,
      trackingUrl,
      estimatedDelivery
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Tracking information updated successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await OrderManagement.generateInvoice(orderId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Invoice generated successfully",
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const addOrderNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note, noteType = 'general' } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note content is required"
      });
    }

    const order = await OrderManagement.addOrderNote(orderId, note, noteType);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Note added successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required"
      });
    }

    const order = await OrderManagement.cancelOrder(orderId, reason);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason, transactionId } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Amount and reason are required"
      });
    }

    const order = await OrderManagement.processRefund(orderId, {
      amount,
      reason,
      transactionId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const stats = await OrderManagement.getOrderStats(startDate, endDate);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateDeliveryAddress = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { street, city, state, zip, country } = req.body;

    if (!street || !city || !zip) {
      return res.status(400).json({
        success: false,
        message: "Street, city, and zip are required"
      });
    }

    const order = await OrderManagement.updateDeliveryAddress(orderId, {
      street,
      city,
      state,
      zip,
      country
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Delivery address updated successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const bulkUpdateStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: "Order IDs array and status are required"
      });
    }

    const result = await OrderManagement.bulkUpdateStatus(orderIds, status);

    res.json({
      success: true,
      message: "Orders updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deleted = await OrderManagement.deleteOrder(orderId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
