import { chatService } from '../services/index.js';

export const getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { limit, before } = req.query;
    
    const messages = await chatService.getMessages(
      req.userId,
      matchId,
      limit ? parseInt(limit) : 50,
      before
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { matchId, content, messageType, mediaUrl } = req.body;
    
    const message = await chatService.sendMessage(
      req.userId,
      matchId,
      content,
      messageType || 'text',
      mediaUrl
    );

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    
    await chatService.markAsRead(req.userId, messageId);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await chatService.getConversations(req.userId);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};
