import { getDB } from "../config/mongodb.js";

export class Settings {
  static async getSettings() {
    const db = getDB();
    const settings = db.collection("settings");
    
    let config = await settings.findOne({ _id: "store-config" });
    if (!config) {
      config = {
        _id: "store-config",
        storeName: "Hezal the Label",
        storeDescription: "",
        storeEmail: "",
        storePhone: "",
        storeAddress: "",
        storeLogo: "",
        storeIcon: "",
        socialMedia: {
          instagram: "",
          facebook: "",
          tiktok: "",
          twitter: "",
          youtube: "",
          pinterest: ""
        },
        paymentMethods: [],
        shippingRates: [],
        businessHours: {
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { open: "10:00", close: "16:00", closed: false },
          sunday: { open: "00:00", close: "00:00", closed: true }
        },
        currency: "USD",
        taxRate: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await settings.insertOne(config);
    }
    return config;
  }

  static async updateSettings(updates) {
    const db = getDB();
    const settings = db.collection("settings");
    
    const result = await settings.findOneAndUpdate(
      { _id: "store-config" },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  static async updateStoreInfo(storeInfo) {
    return await this.updateSettings({
      storeName: storeInfo.storeName,
      storeDescription: storeInfo.storeDescription,
      storeEmail: storeInfo.storeEmail,
      storePhone: storeInfo.storePhone,
      storeAddress: storeInfo.storeAddress,
      storeLogo: storeInfo.storeLogo,
      storeIcon: storeInfo.storeIcon
    });
  }

  static async updateSocialMedia(socialLinks) {
    return await this.updateSettings({
      socialMedia: socialLinks
    });
  }

  static async updatePaymentMethods(methods) {
    return await this.updateSettings({
      paymentMethods: methods
    });
  }

  static async updateShippingRates(rates) {
    return await this.updateSettings({
      shippingRates: rates
    });
  }

  static async updateBusinessHours(hours) {
    return await this.updateSettings({
      businessHours: hours
    });
  }

  static async updateCurrency(currency, taxRate) {
    return await this.updateSettings({
      currency,
      taxRate
    });
  }
}
