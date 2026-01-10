import { Cart } from '../models/Cart.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import {
  generateSessionId,
  getSessionIdFromRequest,
  getTokenFromRequest,
  isGuestSession,
} from '../utils/guestSession.js';

// Helper to verify JWT token
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

export const getCart = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      // No auth or guest session - create new guest session
      const sessionId = generateSessionId();
      return res.status(200).json({
        sessionId,
        items: [],
        message: 'Guest cart created - use this sessionId for future requests',
      });
    }

    const cart = await Cart.findByIdentifier(auth.identifier, auth.isGuest);

    if (!cart) {
      return res.status(200).json({
        [auth.isGuest ? 'sessionId' : 'userId']: auth.identifier,
        items: [],
        message: 'Cart is empty',
        isGuest: auth.isGuest,
      });
    }

    // Calculate totals
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const response = {
      _id: cart._id,
      items: cart.items,
      itemCount,
      total: parseFloat(total.toFixed(2)),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      isGuest: auth.isGuest,
    };

    if (auth.isGuest) {
      response.sessionId = auth.identifier;
      if (cart.expiresAt) {
        response.expiresAt = cart.expiresAt;
      }
    } else {
      response.userId = cart.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

export const addToCart = async (req, res) => {
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

    const { id, name, price, quantity, image, size, color } = req.body;

    // Validation
    if (!id || !name || !price || !quantity) {
      return res.status(400).json({
        message: 'Missing required fields: id, name, price, quantity',
      });
    }

    const item = {
      id,
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image,
      size,
      color,
    };

    const result = await Cart.addToCart(auth.identifier, item, auth.isGuest);

    // Handle both new cart creation and existing cart update
    let updatedCart;
    if (result._id) {
      // New cart was created
      updatedCart = result;
    } else {
      // Existing cart was updated, get the value from findOneAndUpdate result
      updatedCart = result;
    }

    if (!updatedCart) {
      return res.status(500).json({ message: 'Failed to add item to cart' });
    }

    const total = updatedCart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const response = {
      message: 'Item added to cart',
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        itemCount,
        total: parseFloat(total.toFixed(2)),
        updatedAt: updatedCart.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.cart.sessionId = auth.identifier;
      if (updatedCart.expiresAt) {
        response.cart.expiresAt = updatedCart.expiresAt;
      }
    } else {
      response.cart.userId = updatedCart.userId;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      return res.status(401).json({ message: 'No authentication or session provided' });
    }

    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    const result = await Cart.removeFromCart(auth.identifier, itemId, auth.isGuest);
    const updatedCart = result;

    if (!updatedCart) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const total = updatedCart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const response = {
      message: 'Item removed from cart',
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        itemCount,
        total: parseFloat(total.toFixed(2)),
        updatedAt: updatedCart.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.cart.sessionId = auth.identifier;
      if (updatedCart.expiresAt) {
        response.cart.expiresAt = updatedCart.expiresAt;
      }
    } else {
      response.cart.userId = updatedCart.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item', error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      return res.status(401).json({ message: 'No authentication or session provided' });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        message: 'Item ID and quantity are required',
      });
    }

    const numQuantity = parseInt(quantity);
    const result = await Cart.updateQuantity(auth.identifier, itemId, numQuantity, auth.isGuest);
    const updatedCart = result;

    if (!updatedCart) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const total = updatedCart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = updatedCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const response = {
      message: 'Quantity updated',
      cart: {
        _id: updatedCart._id,
        items: updatedCart.items,
        itemCount,
        total: parseFloat(total.toFixed(2)),
        updatedAt: updatedCart.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.cart.sessionId = auth.identifier;
      if (updatedCart.expiresAt) {
        response.cart.expiresAt = updatedCart.expiresAt;
      }
    } else {
      response.cart.userId = updatedCart.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Failed to update quantity', error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const auth = getIdentifier(req);

    if (!auth) {
      return res.status(401).json({ message: 'No authentication or session provided' });
    }

    const result = await Cart.clearCart(auth.identifier, auth.isGuest);
    const updatedCart = result;

    if (!updatedCart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const response = {
      message: 'Cart cleared successfully',
      cart: {
        _id: updatedCart._id,
        items: [],
        itemCount: 0,
        total: 0,
        updatedAt: updatedCart.updatedAt,
        isGuest: auth.isGuest,
      },
    };

    if (auth.isGuest) {
      response.cart.sessionId = auth.identifier;
      if (updatedCart.expiresAt) {
        response.cart.expiresAt = updatedCart.expiresAt;
      }
    } else {
      response.cart.userId = updatedCart.userId;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};
