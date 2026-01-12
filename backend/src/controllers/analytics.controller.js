import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { getDB } from "../config/mongodb.js";

/**
 * Get sales and revenue trends
 */
export const getSalesAndRevenueData = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const db = getDB();
    const orders = db.collection("orders");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get orders in date range
    const salesData = await orders.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    // Format data
    const formattedData = salesData.map(item => ({
      date: item._id,
      sales: item.sales,
      revenue: parseFloat(item.revenue.toFixed(2))
    }));

    res.json({
      success: true,
      data: formattedData,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error("Get sales data error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get visitor and conversion data
 */
export const getConversionData = async (req, res) => {
  try {
    const db = getDB();
    const orders = db.collection("orders");

    // Get weekly conversion data
    const conversionData = await orders.aggregate([
      {
        $group: {
          _id: {
            $week: "$createdAt"
          },
          transactions: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 4
      }
    ]).toArray();

    // Format data
    const formattedData = conversionData.map((item, idx) => ({
      week: `Week ${item._id}`,
      visitors: Math.floor(Math.random() * 5000) + 1000, // Placeholder
      conversion: item.transactions
    }));

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error("Get conversion data error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get top products
 */
export const getTopProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const db = getDB();
    const orders = db.collection("orders");
    const products = db.collection("products");

    // Get top products by order count
    const topProductIds = await orders.aggregate([
      {
        $unwind: "$items"
      },
      {
        $group: {
          _id: "$items.productId",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $sort: { sales: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]).toArray();

    // Get product details
    const topProducts = await Promise.all(
      topProductIds.map(async (item) => {
        const product = await products.findOne({ 
          _id: item._id
        });
        return {
          id: item._id,
          name: product?.name || "Unknown Product",
          sales: item.sales,
          revenue: parseFloat(item.revenue.toFixed(2))
        };
      })
    );

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error("Get top products error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get key metrics (daily, weekly, monthly)
 */
export const getKeyMetrics = async (req, res) => {
  try {
    const { period = "daily" } = req.query;
    const db = getDB();
    const orders = db.collection("orders");

    let dateRange;
    let groupFormat;

    if (period === "daily") {
      dateRange = 1;
      groupFormat = "%Y-%m-%d";
    } else if (period === "weekly") {
      dateRange = 7;
      groupFormat = "%G-W%V";
    } else {
      dateRange = 30;
      groupFormat = "%Y-%m";
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Get metrics
    const metrics = await orders.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]).toArray();

    const metric = metrics[0] || {
      totalTransactions: 0,
      totalRevenue: 0,
      avgOrderValue: 0
    };

    // Get customer count
    const customers = await User.getAllCustomers({ limit: 1000, offset: 0 });

    res.json({
      success: true,
      data: {
        uniqueVisitors: Math.floor(customers.pagination.total * 1.5), // Estimation
        transactions: metric.totalTransactions,
        revenue: parseFloat(metric.totalRevenue.toFixed(2)),
        avgOrderValue: parseFloat(metric.avgOrderValue.toFixed(2)),
        period: period
      }
    });
  } catch (error) {
    console.error("Get metrics error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
