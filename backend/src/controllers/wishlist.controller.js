import { Wishlist } from '../models/Wishlist.js';
import jwt from 'jsonwebtoken';
import {
  generateSessionId,
  getSessionIdFromRequest,
  getTokenFromRequest,
  isGuestSession,
} from '../utils/guestSession.js';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Helper to get user or guest identifier
const getIdentifier = (req) => {
  // Check for guest session first
  if (isGuestSession(req)) {
    return {
      identifier: getSessionIdFromRequest(req),
      isGuest: true,
    };
  }

  // Check for authenticated user
  const token = getTokenFromRequest(req);
  if (token) {
    const user = verifyToken(token);
    if (user) {
      return {
        identifier: user.id.toString(),
        isGuest: false,
      };
    }
  }

  return null;
};

export const getWishlist = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      // No auth or guest session - create new guest session
      const sessionId = generateSessionId();
      return res.status(200).json({
        sessionId,
        items: [],
        message: 'Guest wishlist created - use this sessionId for future requests',
      });
    }

    const wishlist = await Wishlist.findByIdentifier(auth.identifier, auth.isGuest);

    if (!wishlist) {
      const response = {
        items: [],
        message: 'Wishlist is empty',
        isGuest: auth.isGuest,
      };

      if (auth.isGuest) {
        response.sessionId = auth.identifier;
      } else {
        response.userId = auth.identifier;
      }

      return res.status(200).json(response);
    }

    const response = {
      _id: wishlist._id,
      items: wishlist.items,
      count: wishlist.items.length,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
      isGuest: auth.isGuest,
    };

    if (auth.isGuest) {
      response.sessionId = auth.identifier;
      if (wishlist.expiresAt) {
        response.expiresAt = wishlist.expiresAt;
      }
    } else {
      response.userId = wishlist.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    let auth = getIdentifier(req);

    // If no auth/guest session, create one
    if (!auth) {
      const sessionId = generateSessionId();
      auth = {
        identifier: sessionId,
        isGuest: true,
      };
    }

    const { id, name, price, image } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: 'Missing required fields: id, name' });
    }

    const item = {
      id,
      name,
      price: price !== undefined ? parseFloat(price) : undefined,
      image,
      addedAt: new Date().getTime(),
    };

    const result = await Wishlist.addToWishlist(auth.identifier, item, auth.isGuest);
    const updatedWishlist = result;

    if (!updatedWishlist) {
      return res.status(500).json({ message: 'Failed to add to wishlist' });
    }

    const response = {
      message: 'Item added to wishlist',
      wishlist: {
        _id: updatedWishlist._id,
        items: updatedWishlist.items,
        count: updatedWishlist.items.length,
        updatedAt: updatedWishlist.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.wishlist.sessionId = auth.identifier;
      if (updatedWishlist.expiresAt) {
        response.wishlist.expiresAt = updatedWishlist.expiresAt;
      }
    } else {
      response.wishlist.userId = updatedWishlist.userId;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      return res.status(401).json({ message: 'No authentication or session provided' });
    }

    const { itemId } = req.params;
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    const result = await Wishlist.removeFromWishlist(auth.identifier, itemId, auth.isGuest);
    const updatedWishlist = result;

    if (!updatedWishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const response = {
      message: 'Item removed from wishlist',
      wishlist: {
        _id: updatedWishlist._id,
        items: updatedWishlist.items,
        count: updatedWishlist.items.length,
        updatedAt: updatedWishlist.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.wishlist.sessionId = auth.identifier;
      if (updatedWishlist.expiresAt) {
        response.wishlist.expiresAt = updatedWishlist.expiresAt;
      }
    } else {
      response.wishlist.userId = updatedWishlist.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      return res.status(401).json({ message: 'No authentication or session provided' });
    }

    const result = await Wishlist.clearWishlist(auth.identifier, auth.isGuest);
    const updatedWishlist = result;

    if (!updatedWishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const response = {
      message: 'Wishlist cleared successfully',
      wishlist: {
        _id: updatedWishlist._id,
        items: [],
        count: 0,
        updatedAt: updatedWishlist.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.wishlist.sessionId = auth.identifier;
      if (updatedWishlist.expiresAt) {
        response.wishlist.expiresAt = updatedWishlist.expiresAt;
      }
    } else {
      response.wishlist.userId = updatedWishlist.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Failed to clear wishlist', error: error.message });
  }
};
