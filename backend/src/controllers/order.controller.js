import { Order } from '../models/Order.js';
import { OTP } from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import { mailService } from '../utils/mailService.js';

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

    // Send order confirmation email
    try {
      const { mailService } = await import('../utils/mailService.js');
      await mailService.sendOrderConfirmationEmail(email, {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        items: items,
        subtotal: parseFloat(subtotal),
        shipping: parseFloat(shipping),
        tax: parseFloat(tax),
        grandTotal: parseFloat(grandTotal),
        firstName: firstName,
        deliveryAddress: `${deliveryStreet || billingStreet}, ${deliveryCity || billingCity}, ${deliveryState || billingState} ${deliveryZip || billingZip}`
      });
      console.log('✅ Order confirmation email sent');
    } catch (emailError) {
      console.warn('⚠️ Order confirmation email failed (non-critical):', emailError.message);
      // Don't fail order creation if email fails
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
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
// PUBLIC: Track order by order number (no authentication required)
export const trackOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    console.log('🔍 Tracking order with number:', orderNumber);

    if (!orderNumber || orderNumber === 'undefined') {
      return res.status(400).json({ message: 'Order number is required' });
    }

    // Extract the ID part from orderNumber (format: ORD-XXXXXXXX)
    let searchId = orderNumber;
    if (orderNumber.startsWith('ORD-')) {
      searchId = orderNumber.substring(4); // Remove 'ORD-' prefix
    }

    // Try to find by ObjectId
    let order = null;
    
    if (searchId.length === 8) {
      // Search for orders where the last 8 chars of _id match (case-insensitive)
      const { getDB } = await import('../config/mongodb.js');
      const db = getDB();
      const { ObjectId } = await import('mongodb');
      
      // Get all orders and filter by last 8 chars of ObjectId
      const allOrders = await db.collection('orders').find({}).toArray();
      order = allOrders.find(o => 
        o._id.toString().slice(-8).toUpperCase() === searchId.toUpperCase()
      );
    } else if (searchId.length === 24) {
      // Full ObjectId
      order = await Order.findById(searchId);
    }

    console.log('📦 Order lookup result:', order ? 'Found' : 'Not found');

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found. Please check the order number from your confirmation email (e.g., ORD-4BB719DD).' 
      });
    }

    // Normalize order (adds virtual orderNumber if missing)
    order = Order.normalizeOrder(order);

    // Return public order information
    res.status(200).json({
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        personalInfo: order.personalInfo,
        totals: order.totals,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ message: 'Failed to track order', error: error.message });
  }
};

/**
 * Request OTP for order tracking
 * Validates order number and email, then sends OTP
 */
export const requestOrderOTP = async (req, res) => {
  try {
    const { orderNumber, email } = req.body;

    console.log('📧 OTP request received');

    // Validate inputs
    if (!orderNumber || !email) {
      return res.status(400).json({ message: 'Order number and email are required' });
    }

    // Extract ID from order number
    let searchId = orderNumber;
    if (orderNumber.startsWith('ORD-')) {
      searchId = orderNumber.substring(4);
    }

    // Find the order
    let order = null;
    
    if (searchId.length === 8) {
      const { getDB } = await import('../config/mongodb.js');
      const db = getDB();
      const allOrders = await db.collection('orders').find({}).toArray();
      order = allOrders.find(o => 
        o._id.toString().slice(-8).toUpperCase() === searchId.toUpperCase()
      );
    } else if (searchId.length === 24) {
      order = await Order.findById(searchId);
    }

    // Verify email matches order
    if (!order || !order.personalInfo || order.personalInfo.email !== email) {
      return res.status(404).json({ 
        message: 'Order not found or email does not match. Please check your order number and email.' 
      });
    }

    // Generate and save OTP
    const otpRecord = await OTP.create(email, orderNumber);
    
    // Send OTP via email
    const emailSent = await mailService.sendOTPEmail(email, otpRecord.code, orderNumber);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.status(200).json({ 
      message: 'OTP sent to your email. Valid for 10 minutes.',
      otpId: otpRecord._id
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ message: 'Failed to request OTP', error: error.message });
  }
};

/**
 * Verify OTP and return order details
 */
export const verifyOrderOTP = async (req, res) => {
  try {
    const { orderNumber, email, otp } = req.body;

    console.log('🔐 Verifying OTP for order:', orderNumber);

    // Validate inputs
    if (!orderNumber || !email || !otp) {
      return res.status(400).json({ message: 'Order number, email, and OTP are required' });
    }

    // Verify OTP
    const otpRecord = await OTP.findValid(email, orderNumber, otp);

    if (!otpRecord) {
      return res.status(401).json({ 
        message: 'Invalid or expired OTP. Please request a new code.' 
      });
    }

    // Mark OTP as used
    await OTP.markAsUsed(otpRecord._id);

    // Extract ID from order number
    let searchId = orderNumber;
    if (orderNumber.startsWith('ORD-')) {
      searchId = orderNumber.substring(4);
    }

    // Find and return order
    let order = null;
    
    if (searchId.length === 8) {
      const { getDB } = await import('../config/mongodb.js');
      const db = getDB();
      const allOrders = await db.collection('orders').find({}).toArray();
      order = allOrders.find(o => 
        o._id.toString().slice(-8).toUpperCase() === searchId.toUpperCase()
      );
      if (order) {
        order = Order.normalizeOrder(order);
      }
    } else if (searchId.length === 24) {
      order = await Order.findById(searchId);
    }

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found.' 
      });
    }

    // Return public order information
    res.status(200).json({
      message: 'OTP verified successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        personalInfo: order.personalInfo,
        totals: order.totals,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};