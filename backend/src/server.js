import { createServer } from 'http';
import app from './app.js';
import config from './config/index.js';
import connectDB from './config/database.js';
import { initSocket } from './socket/index.js';

const startServer = async () => {
  try {
    await connectDB();
    
    const server = createServer(app);
    initSocket(server);
    
    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
