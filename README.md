# Near Me - Social & Dating Application

A modern social and dating application with real-time map-based interaction, blind matching, and live chat.

## Features

- **Map-Based Discovery**: Find and interact with nearby users on an interactive map
- **Real-Time Chat**: Socket.io powered messaging with typing indicators and read receipts
- **Blind Match**: Connect anonymously before revealing profiles
- **Friend System**: Send, accept, and manage friend requests
- **Match System**: Like/dislike users with mutual match notifications
- **Admin Panel**: Manage users, matches, and reports

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io for real-time
- JWT Authentication
- Joi validation
- Rate limiting

### Frontend (User App)
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Leaflet (maps)
- Socket.io client

### Admin Panel
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Recharts (analytics)
- Zustand (state management)

## Project Structure

```
near-me/
├── backend/              # Express API server
│   └── src/
│       ├── config/       # Configuration
│       ├── controllers/  # Request handlers
│       ├── services/     # Business logic
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API routes
│       ├── middlewares/  # Express middleware
│       └── socket/       # Socket.io handlers
├── frontend/             # User application
│   └── src/
│       ├── components/   # UI components
│       ├── features/     # Feature modules
│       ├── services/     # API clients
│       └── store/        # Zustand stores
├── admin/                # Admin panel
│   └── src/
│       ├── components/   # UI components
│       ├── features/     # Admin pages
│       ├── services/     # API clients
│       └── store/        # Zustand stores
└── SPEC.md               # Design specification
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone and install dependencies:
```bash
npm run install:all
```

2. Configure environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

3. Create admin user:
```bash
npm run seed:admin
```
Default admin: `admin@nearme.com` / `admin123`

4. Start development servers:
```bash
npm run dev
```

This starts:
- Backend API at http://localhost:5000
- Frontend at http://localhost:5173
- Admin Panel at http://localhost:5174

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/nearby` - Find nearby users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/location` - Update location
- `POST /api/users/like/:id` - Like user
- `POST /api/users/dislike/:id` - Dislike user

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/blind` - Get blind matches
- `POST /api/matches/blind` - Create blind match
- `PUT /api/matches/:id/reveal` - Reveal blind match
- `DELETE /api/matches/:id` - Unmatch

### Chat
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/:matchId` - Get messages
- `POST /api/messages` - Send message

### Friends
- `GET /api/friends` - Get friends list
- `GET /api/friends/requests` - Get pending requests
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/request/:id/accept` - Accept request
- `PUT /api/friends/request/:id/reject` - Reject request
- `DELETE /api/friends/:id` - Remove friend

### Admin
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get admin profile
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/toggle-status` - Ban/unban user
- `GET /api/admin/matches` - List all matches
- `DELETE /api/admin/matches/:id` - Delete match

## Socket.io Events

### Client → Server
- `send_message` - Send a message
- `typing_start` / `typing_stop` - Typing indicators
- `mark_read` - Mark messages as read
- `join_match` / `leave_match` - Join/leave chat rooms
- `location_update` - Update user location

### Server → Client
- `new_message` - Receive message
- `user_typing` - Typing indicator
- `messages_read` - Read receipt
- `new_match` - Match created
- `user_online` / `user_offline` - Online status

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nearme
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## License

MIT
# near-me
# ecom
