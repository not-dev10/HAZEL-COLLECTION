import { User } from "../models/User.js";

/**
 * Get all customers (admin only)
 */
export const getAllCustomers = async (req, res) => {
  try {
    const { limit = 10, offset = 0, status, search } = req.query;

    const result = await User.getAllCustomers({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      search
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get single customer details
 */
export const getCustomerById = async (req, res) => {
  try {
    const { customerId } = req.params;

    const user = await User.findById(customerId);
    
    if (!user || user.isGuest) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.json({
      success: true,
      data: User.formatCustomerResponse(user)
    });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async (req, res) => {
  try {
    const stats = await User.getCustomerStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get customer stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update customer information
 */
export const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const updates = req.body;

    const updated = await User.updateProfile(customerId, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or no changes made"
      });
    }

    const user = await User.findById(customerId);

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: User.formatCustomerResponse(user)
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete a customer (admin only)
 */
export const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Validate customerId
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required"
      });
    }

    // Check if customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    // Prevent deletion of admin users
    if (customer.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users"
      });
    }

    // Delete the customer
    const deleted = await User.deleteAccount(customerId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete customer"
      });
    }

    console.log(`✅ Customer ${customerId} deleted successfully`);

    res.json({
      success: true,
      message: "Customer deleted successfully",
      customerId: customerId
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
