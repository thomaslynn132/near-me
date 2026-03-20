import { userService, locationService } from '../services/index.js';

export const getNearbyUsers = async (req, res, next) => {
  try {
    const { lng, lat, radius } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates required'
      });
    }

    const users = await locationService.getUsersInRadius(
      req.userId,
      parseFloat(lng),
      parseFloat(lat),
      radius ? parseFloat(radius) : null
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getUserProfile(req.userId, userId);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.userId, req.body);

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;
    
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates [longitude, latitude] required'
      });
    }

    const user = await locationService.updateUserLocation(req.userId, coordinates);

    res.json({
      success: true,
      data: {
        location: user.location
      }
    });
  } catch (error) {
    next(error);
  }
};

export const likeUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const result = await userService.likeUser(req.userId, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const dislikeUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const result = await userService.dislikeUser(req.userId, userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const setOnlineStatus = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    
    const user = await userService.setOnlineStatus(req.userId, isOnline);

    res.json({
      success: true,
      data: { isOnline: user.isOnline }
    });
  } catch (error) {
    next(error);
  }
};
