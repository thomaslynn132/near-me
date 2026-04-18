import { authService } from '../services/index.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    req.userId = decoded.userId;
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = authService.verifyToken(token);
      req.userId = decoded.userId;
      req.user = { id: decoded.userId };
    }
    next();
  } catch (error) {
    next();
  }
};

export { auth as default, auth, optionalAuth };
export const protect = auth;
