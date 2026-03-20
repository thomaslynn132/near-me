import { friendService } from '../services/index.js';

export const sendRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const request = await friendService.sendRequest(req.userId, receiverId);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await friendService.acceptRequest(req.userId, requestId);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await friendService.rejectRequest(req.userId, requestId);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const friends = await friendService.getFriends(req.userId);
    res.json({ success: true, data: friends });
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await friendService.getPendingRequests(req.userId);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const result = await friendService.removeFriend(req.userId, friendId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
