import { getDB } from "../config/mongodb.js";

export class HomePage {
  static async getHomePageContent() {
    const db = getDB();
    const homePageCollection = db.collection("homePage");
    
    let content = await homePageCollection.findOne({ _id: "home-content" });
    if (!content) {
      content = {
        _id: "home-content",
        carousel: {
          slides: [
            {
              id: 1,
              imageUrl: "",
              collection: "Studio Portraits",
              subtitle: "Hezal the Label Bridal 2025",
              cta: "LIVE NOW",
              order: 1
            },
            {
              id: 2,
              imageUrl: "",
              collection: "Winter Luxe",
              subtitle: "Festive Collection 2025",
              cta: "SHOP NOW",
              order: 2
            },
            {
              id: 3,
              imageUrl: "",
              collection: "Ethereal Dreams",
              subtitle: "Ready To Wear Collection",
              cta: "EXPLORE",
              order: 3
            }
          ]
        },
        newArrivals: {
          heading: "New Arrivals",
          subheading: "Discover Our Collection",
          limit: 8,
          visible: true
        },
        bridalSection: {
          visible: true,
          heading: "Bridal Collection 2025",
          subheading: "The Art of Craftsmanship",
          description: "Each piece is meticulously handcrafted by our master artisans, preserving centuries-old techniques while embracing contemporary elegance. Our bridal collection celebrates the beauty of tradition interwoven with modern sophistication.",
          buttonText: "Explore Collection",
          buttonLink: "/collection/bridals",
          imageUrl: ""
        },
        collectionBanner: {
          visible: true,
          collections: [
            {
              id: 1,
              title: "Ready To Wear",
              subtitle: "Effortless Elegance",
              imageUrl: "",
              link: "/collection/ready-to-wear",
              order: 1
            },
            {
              id: 2,
              title: "Unstitched",
              subtitle: "Create Your Own",
              imageUrl: "",
              link: "/collection/unstitched",
              order: 2
            }
          ]
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await homePageCollection.insertOne(content);
    }
    return content;
  }

  static async updateCarouselSlides(slides) {
    const db = getDB();
    const homePageCollection = db.collection("homePage");
    
    const result = await homePageCollection.findOneAndUpdate(
      { _id: "home-content" },
      {
        $set: {
          "carousel.slides": slides,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  static async updateNewArrivalsSection(newArrivalsData) {
    const db = getDB();
    const homePageCollection = db.collection("homePage");
    
    const result = await homePageCollection.findOneAndUpdate(
      { _id: "home-content" },
      {
        $set: {
          newArrivals: newArrivalsData,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  static async updateBridalSection(bridalData) {
    const db = getDB();
    const homePageCollection = db.collection("homePage");
    
    const result = await homePageCollection.findOneAndUpdate(
      { _id: "home-content" },
      {
        $set: {
          bridalSection: bridalData,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  static async updateCollectionBanner(collectionData) {
    const db = getDB();
    const homePageCollection = db.collection("homePage");
    
    const result = await homePageCollection.findOneAndUpdate(
      { _id: "home-content" },
      {
        $set: {
          collectionBanner: collectionData,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result;
  }

  static async updateHomePageContent(updates) {
    const db = getDB();
    const homePageCollection = db.collection("homePage");
    
    const result = await homePageCollection.findOneAndUpdate(
      { _id: "home-content" },
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
}
