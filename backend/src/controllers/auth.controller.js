import { authService } from '../services/index.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, age, bio, interests } = req.body;
    
    const { user, token } = await authService.register({
      name,
      email,
      password,
      age,
      bio,
      interests
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const { user, token } = await authService.login(email, password);

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.userId);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId);

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};
