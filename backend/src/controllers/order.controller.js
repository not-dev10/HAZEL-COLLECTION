import { Order } from '../models/Order.js';
import jwt from 'jsonwebtoken';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

export const createOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = user.id.toString();
    const {
      items,
      firstName,
      lastName,
      email,
      phone,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      deliveryStreet,
      deliveryCity,
      deliveryState,
      deliveryZip,
      deliveryCountry,
      sameAsDelivery,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      grandTotal,
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required' });
    }

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({
        message: 'Missing personal information: firstName, lastName, email, phone',
      });
    }

    if (!billingStreet || !billingCity || !billingState || !billingZip) {
      return res.status(400).json({
        message: 'Missing billing address information',
      });
    }

    if (!sameAsDelivery) {
      if (!deliveryStreet || !deliveryCity || !deliveryState || !deliveryZip) {
        return res.status(400).json({
          message: 'Missing delivery address information',
        });
      }
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const orderData = {
      userId,
      items,
      firstName,
      lastName,
      email,
      phone,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      billingCountry,
      deliveryStreet: sameAsDelivery ? billingStreet : deliveryStreet,
      deliveryCity: sameAsDelivery ? billingCity : deliveryCity,
      deliveryState: sameAsDelivery ? billingState : deliveryState,
      deliveryZip: sameAsDelivery ? billingZip : deliveryZip,
      deliveryCountry: sameAsDelivery ? billingCountry : deliveryCountry,
      sameAsDelivery,
      paymentMethod,
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shipping),
      tax: parseFloat(tax),
      grandTotal: parseFloat(grandTotal),
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        _id: order._id,
        userId: order.userId,
        items: order.items,
        personalInfo: order.personalInfo,
        billingAddress: order.billingAddress,
        deliveryAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        totals: order.totals,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }

    res.status(200).json({
      _id: order._id,
      userId: order.userId,
      items: order.items,
      personalInfo: order.personalInfo,
      billingAddress: order.billingAddress,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod,
      totals: order.totals,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = user.id.toString();
    const orders = await Order.findByUserId(userId);

    res.status(200).json({
      count: orders.length,
      orders: orders.map((order) => ({
        _id: order._id,
        items: order.items,
        personalInfo: order.personalInfo,
        totals: order.totals,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }

    try {
      const result = await Order.updateStatus(orderId, status);
      
      // Get the updated order to ensure we have the latest data
      const updatedOrder = await Order.findById(orderId);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found after update' });
      }

      res.status(200).json({
        message: 'Order status updated successfully',
        order: {
          _id: updatedOrder._id,
          status: updatedOrder.status,
          updatedAt: updatedOrder.updatedAt,
        },
      });
    } catch (updateError) {
      console.error('Error in status update:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }

    await Order.deleteOrder(orderId);

    res.status(200).json({
      message: 'Order deleted successfully',
      _id: orderId,
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};
