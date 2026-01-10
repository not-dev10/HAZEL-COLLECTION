import { getDB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export class Review {
  static async create({ productId, customerId, customerName, rating, title, comment }) {
    const db = getDB();
    const reviews = db.collection("reviews");

    const result = await reviews.insertOne({
      _id: new ObjectId(),
      productId,
      customerId,
      customerName,
      rating: Number(rating),
      title,
      comment,
      status: 'pending',
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return result.insertedId;
  }

  static async findById(id) {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    return await reviews.findOne({ _id: new ObjectId(id) });
  }

  static async findByProductId(productId, onlyApproved = true) {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    const query = { productId };
    if (onlyApproved) {
      query.status = 'approved';
    }
    
    return await reviews.find(query).sort({ createdAt: -1 }).toArray();
  }

  static async findAll() {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    return await reviews.find({}).sort({ createdAt: -1 }).toArray();
  }

  static async findByCustomerAndProduct(customerId, productId) {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    return await reviews.findOne({ customerId, productId });
  }

  static async updateStatus(id, status) {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    const result = await reviews.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  static async delete(id) {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    const result = await reviews.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount > 0;
  }

  static async incrementHelpful(id) {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    const result = await reviews.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $inc: { helpful: 1 },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }

  static async createTTLIndex() {
    const db = getDB();
    const reviews = db.collection("reviews");
    
    try {
      await reviews.createIndex({ productId: 1, status: 1 });
      console.log('✅ Review indexes created successfully');
    } catch (error) {
      console.error('Error creating review indexes:', error);
    }
  }
}

export default Review;
