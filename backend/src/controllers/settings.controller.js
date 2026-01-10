import { Settings } from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStoreInfo = async (req, res) => {
  try {
    const { storeName, storeDescription, storeEmail, storePhone, storeAddress, storeLogo, storeIcon } = req.body;

    if (!storeName || !storeEmail || !storePhone) {
      return res.status(400).json({
        success: false,
        message: "Store name, email, and phone are required"
      });
    }

    const updated = await Settings.updateStoreInfo({
      storeName,
      storeDescription,
      storeEmail,
      storePhone,
      storeAddress,
      storeLogo,
      storeIcon
    });

    res.json({
      success: true,
      message: "Store info updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSocialMedia = async (req, res) => {
  try {
    const socialLinks = req.body;

    const updated = await Settings.updateSocialMedia(socialLinks);

    res.json({
      success: true,
      message: "Social media links updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePaymentMethods = async (req, res) => {
  try {
    const { methods } = req.body;

    if (!Array.isArray(methods)) {
      return res.status(400).json({
        success: false,
        message: "Methods must be an array"
      });
    }

    const updated = await Settings.updatePaymentMethods(methods);

    res.json({
      success: true,
      message: "Payment methods updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateShippingRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!Array.isArray(rates)) {
      return res.status(400).json({
        success: false,
        message: "Rates must be an array"
      });
    }

    const updated = await Settings.updateShippingRates(rates);

    res.json({
      success: true,
      message: "Shipping rates updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBusinessHours = async (req, res) => {
  try {
    const hours = req.body;

    const updated = await Settings.updateBusinessHours(hours);

    res.json({
      success: true,
      message: "Business hours updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCurrency = async (req, res) => {
  try {
    const { currency, taxRate } = req.body;

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: "Currency is required"
      });
    }

    const updated = await Settings.updateCurrency(currency, taxRate || 0);

    res.json({
      success: true,
      message: "Currency settings updated successfully",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
