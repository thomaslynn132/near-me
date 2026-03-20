import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User } from '../models/index.js';
import { chatService, matchService } from '../services/index.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.clientUrl,
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });
    socket.join(`user:${socket.userId}`);
    io.emit('user_online', { userId: socket.userId });

    socket.on('send_message', async (data) => {
      try {
        const { matchId, content, messageType, mediaUrl } = data;
        const message = await chatService.sendMessage(socket.userId, matchId, content, messageType, mediaUrl);
        
        io.to(`user:${message.receiverId}`).emit('new_message', message);
        io.to(`match:${matchId}`).emit('message_sent', message);
        
        if (message.matchId?.isBlind && !message.matchId?.isRevealed) {
          const match = await matchService.getMatchById(matchId);
          if (match.messageCount >= match.revealThreshold) {
            io.to(`user:${socket.userId}`).emit('can_reveal', { matchId });
          }
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('typing_start', (data) => {
      const { matchId } = data;
      socket.to(`match:${matchId}`).emit('user_typing', { userId: socket.userId, matchId });
    });

    socket.on('typing_stop', (data) => {
      const { matchId } = data;
      socket.to(`match:${matchId}`).emit('user_stop_typing', { userId: socket.userId, matchId });
    });

    socket.on('mark_read', async (data) => {
      try {
        const { matchId } = data;
        await chatService.markMessagesAsRead(socket.userId, matchId);
        socket.to(`match:${matchId}`).emit('messages_read', { readerId: socket.userId, matchId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('join_match', (data) => {
      const { matchId } = data;
      socket.join(`match:${matchId}`);
    });

    socket.on('leave_match', (data) => {
      const { matchId } = data;
      socket.leave(`match:${matchId}`);
    });

    socket.on('location_update', async (data) => {
      try {
        const { coordinates } = data;
        const user = await User.findByIdAndUpdate(socket.userId, {
          location: { type: 'Point', coordinates }
        }, { new: true });
        
        socket.to('map_updates').emit('user_location_changed', {
          userId: socket.userId,
          location: user.location
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      io.emit('user_offline', { userId: socket.userId });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
