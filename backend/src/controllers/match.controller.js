import { matchService, userService } from '../services/index.js';

export const getMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getMatches(req.userId);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

export const getBlindMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getBlindMatches(req.userId);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const match = await matchService.createMatch(req.userId, userId);

    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

export const createBlindMatch = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    const match = await matchService.createBlindMatch(req.userId, userId);

    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

export const revealMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const match = await matchService.revealMatch(req.userId, matchId);

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};

export const unmatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const result = await matchService.unmatch(req.userId, matchId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    
    const match = await matchService.getMatchById(matchId);

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    next(error);
  }
};
