# Near Me - Social & Dating Application

## 1. Concept & Vision

**Near Me** is a modern social and dating application that bridges the gap between online connections and real-world proximity. Unlike traditional dating apps with endless swiping, users discover and connect with people who are physically nearby through an interactive map interface. The app features a unique "Blind Match" system where users can build genuine connections before revealing their profiles, eliminating superficial judgments and encouraging authentic conversations.

The visual identity draws inspiration from **night cityscapes and constellation maps** — dark, atmospheric backgrounds with vibrant gradient accents that suggest discovery and connection. Every interaction feels intimate and immediate, like finding a hidden gem in your neighborhood.

## 2. Design Language

### Aesthetic Direction
**"Midnight Explorer"** — A sophisticated dark theme with bioluminescent accents. Think ocean depths meeting city lights at night. The UI uses depth and subtle glow effects to create a sense of mystery and discovery.

### Color Palette
```
Primary:        #6366f1 (Indigo - main brand color)
Primary Light:  #818cf8 (Lighter indigo for hovers)
Primary Dark:   #4f46e5 (Darker indigo for active states)
Secondary:      #ec4899 (Pink - for matches and hearts)
Accent:         #06b6d4 (Cyan - for online indicators and maps)
Success:        #22c55e (Green - for confirmations)
Warning:        #f59e0b (Amber - for warnings)
Error:          #ef4444 (Red - for errors)

Background:     #0f0f1a (Deep midnight)
Surface:        #1a1a2e (Elevated surfaces)
Surface Light:  #252540 (Cards, inputs)
Border:         #333355 (Subtle borders)
Text Primary:   #f1f5f9 (Primary text)
Text Secondary: #94a3b8 (Secondary text)
Text Muted:     #64748b (Muted text)
```

### Typography
- **Headings**: Inter (700, 600) — Modern, highly legible
- **Body**: Inter (400, 500) — Clean reading experience
- **Accents/Labels**: JetBrains Mono (500) — For timestamps, badges
- **Scale**: 12, 14, 16, 18, 24, 32, 48px

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 6px (small), 12px (medium), 16px (large), 9999px (pill)
- Max content width: 1400px

### Motion Philosophy
- **Micro-interactions**: 150-200ms with ease-out curves
- **Page transitions**: 300ms fade with slight scale
- **Map animations**: Smooth 500ms panning and zooming
- **Chat messages**: Slide in from bottom with 100ms stagger
- **Match animations**: Explosion of particles with 600ms celebration
- **Loading states**: Pulsing gradients at 2s intervals

### Visual Assets
- **Icons**: Lucide React (consistent 24px, 1.5px stroke)
- **Map**: Mapbox GL JS (dark style) or Google Maps with dark mode
- **Avatars**: Gradient placeholders with initials when no image
- **Decorative**: Subtle grid patterns, glow effects, gradient orbs

## 3. Layout & Structure

### Information Architecture

```
/                     → Landing page (unauthenticated) or redirect
/auth/login          → Login form
/auth/register       → Registration form
/app                 → Main app shell
  /app/map           → Interactive map (default view)
  /app/matches       → Match list and match details
  /app/chat          → Chat conversations
  /app/friends       → Friends list and requests
  /app/profile       → User profile
  /app/settings      → App settings
/admin               → Admin panel (React)
  /admin/users       → User management
  /admin/matches     → Match management
  /admin/reports     → Reported content
```

### Page Structure

**Auth Pages**: Centered card on atmospheric gradient background with floating particles

**Map View (Main)**:
- Full-screen map with floating UI elements
- Bottom sheet for user cards (draggable)
- Sidebar drawer for filters and nearby users list
- Top bar with search, notifications, profile

**Chat Interface**:
- Left sidebar: conversation list with online indicators
- Right panel: active chat with message history
- Bottom: input area with media buttons
- Sticky typing indicator

**Match Screen**:
- Card-based stack with swipe gestures
- Match celebration modal with confetti
- Transition to blind chat or full profile

### Responsive Strategy
- **Mobile-first**: Primary target (375px+)
- **Tablet**: Side panels become overlays (768px+)
- **Desktop**: Full three-column layout (1024px+)

## 4. Features & Interactions

### Authentication
- **Register**: Name, email, password, age, interests selection
- **Login**: Email/password with "Remember me"
- **Logout**: Clear tokens, disconnect socket
- **Error states**: Inline validation, shake animation on submit failure

### Location & Discovery
- **Location permission**: Request on first visit, explain benefits
- **Real-time updates**: Location updates every 30s or on significant movement
- **Geospatial queries**: Find users within configurable radius (1-50km)
- **Privacy controls**: Hide exact location, show as "Nearby" only
- **Map markers**: Custom markers with online status ring, distance label

### User Interactions
- **Like**: Heart button or double-tap on card, instant feedback animation
- **Dislike**: X button or swipe left, smooth card exit
- **Super Like**: Star button, 3 per day, highlights recipient
- **Match**: Confetti animation, 3s celebration before chat option

### Blind Match
- **Activation**: Toggle in match settings
- **Profile hide**: Shows only first name, age, and shared interests
- **Message trigger**: After 10 messages, reveal prompt appears
- **Reveal animation**: Blur-to-clear transition with profile card flip
- **Opt-out**: Either user can reveal anytime

### Friend System
- **Send request**: From profile or map marker
- **Accept/Reject**: Notification and inline actions
- **Mutual acceptance**: Both become friends, can see full profiles
- **Block user**: Hide from map, end all connections

### Chat (Real-time)
- **Message types**: Text, images, voice messages, location pins
- **Typing indicator**: "User is typing..." with animated dots
- **Read receipts**: Double check marks (sent/delivered/read)
- **Message status**: Sending, sent, failed (retry option)
- **Online status**: Green dot, "Last seen X mins ago"
- **Message reactions**: Quick emoji reactions on long-press

### Map Interactions
- **Zoom**: Pinch or scroll, markers cluster at low zoom
- **Pan**: Drag, new users load at edges
- **Marker tap**: Open user card bottom sheet
- **Marker long-press**: Quick action menu (like, chat, directions)
- **Current location**: Center button with pulse animation

## 5. Component Inventory

### Buttons
- **Primary**: Gradient background (indigo to pink), white text, glow on hover
- **Secondary**: Transparent with border, primary text, fill on hover
- **Ghost**: No border, subtle hover background
- **Icon**: Circular, 40px, icon-only with tooltip
- **States**: Default, hover (lift + glow), active (press), disabled (50% opacity), loading (spinner)

### Input Fields
- **Text Input**: Dark surface, light border, focus ring with primary color
- **Search**: With icon prefix, clear button on content
- **Textarea**: Auto-resize, character counter
- **Select**: Custom dropdown with search
- **Checkbox/Toggle**: Custom styled with smooth transitions

### Cards
- **User Card**: Photo dominant, name/age/interests overlay, action buttons
- **Match Card**: Stackable, swipe-enabled, profile preview
- **Chat Preview**: Avatar, name, last message, timestamp, unread badge
- **Friend Card**: Compact with accept/reject actions

### Navigation
- **Bottom Nav (Mobile)**: 5 icons, active indicator, labels hidden
- **Sidebar (Desktop)**: Icon + label, collapsible
- **Top Bar**: Logo, search, notifications bell, profile avatar

### Modals
- **Match Modal**: Full-screen celebration with confetti
- **Profile Modal**: Detailed profile with swipe gallery
- **Confirm Dialog**: Action confirmation with cancel/confirm
- **Settings Modal**: Sectioned preferences

### Map Components
- **User Marker**: Avatar with status ring, cluster with count
- **Radius Indicator**: Gradient circle showing search area
- **Bottom Sheet**: Draggable card with user info
- **Location Button**: Center on user with pulse

### Chat Components
- **Message Bubble**: Left (received) / Right (sent), tail indicator
- **Date Separator**: Centered label with line
- **Typing Indicator**: Three animated dots in bubble
- **Voice Message**: Waveform visualization, play button
- **Image Message**: Thumbnail with lightbox on tap

### States
- **Empty State**: Illustration + message + action button
- **Loading**: Skeleton screens with shimmer animation
- **Error State**: Red accent, retry button
- **Offline**: Banner at top, cached data shown

## 6. Technical Approach

### Backend Architecture (Node.js + Express)

```
backend/
├── src/
│   ├── config/           # Database, JWT, Cloudinary config
│   ├── controllers/      # Request handlers (thin, delegate to services)
│   ├── services/         # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── middlewares/     # Auth, validation, error handling
│   ├── utils/           # Helpers, constants
│   ├── socket/          # Socket.io handlers
│   └── app.js           # Express app setup
├── package.json
└── .env
```

### API Design

**Auth Endpoints**
```
POST   /api/auth/register     - Create account
POST   /api/auth/login        - Login, receive JWT
POST   /api/auth/logout       - Invalidate token
GET    /api/auth/me           - Get current user
```

**User Endpoints**
```
GET    /api/users/nearby      - Find users by location
GET    /api/users/:id         - Get user profile
PUT    /api/users/profile     - Update profile
PUT    /api/users/location    - Update location
PUT    /api/users/visibility  - Change visibility
POST   /api/users/like/:id    - Like a user
POST   /api/users/dislike/:id - Dislike a user
```

**Friends Endpoints**
```
GET    /api/friends           - List friends
POST   /api/friends/request   - Send friend request
PUT    /api/friends/request/:id - Accept/reject
DELETE /api/friends/:id       - Remove friend
```

**Matches Endpoints**
```
GET    /api/matches           - List all matches
POST   /api/matches/blind     - Create blind match
PUT    /api/matches/:id/reveal - Reveal blind match
DELETE /api/matches/:id       - Unmatch
```

**Chat Endpoints**
```
GET    /api/messages/:matchId - Get message history
POST   /api/messages          - Send message (fallback for HTTP)
PUT    /api/messages/:id/read - Mark as read
```

### Data Models (MongoDB)

**User Schema**
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  age: Number (required, 18+),
  bio: String (max 500),
  interests: [String],
  profileImages: [{
    url: String,
    publicId: String
  }],
  location: {
    type: "Point",
    coordinates: [Number] // [lng, lat]
  },
  isOnline: Boolean,
  lastSeen: Date,
  visibility: Enum ['public', 'friends', 'hidden'],
  friends: [ObjectId],
  likedUsers: [ObjectId],
  matchedUsers: [ObjectId],
  blindMatches: [ObjectId],
  settings: {
    discoveryRadius: Number,
    showOnlineStatus: Boolean,
    darkMode: Boolean
  },
  createdAt, updatedAt
}
```

**Message Schema**
```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  matchId: ObjectId,
  content: String,
  messageType: Enum ['text', 'image', 'voice'],
  mediaUrl: String,
  isRead: Boolean,
  readAt: Date,
  createdAt
}
```

**Match Schema**
```javascript
{
  users: [ObjectId],
  isBlind: Boolean,
  isRevealed: Boolean,
  messageCount: Number,
  revealThreshold: Number (default 10),
  lastMessageAt: Date,
  createdAt
}
```

**FriendRequest Schema**
```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  status: Enum ['pending', 'accepted', 'rejected'],
  createdAt,
  updatedAt
}
```

### Frontend Architecture (React + Vite)

```
frontend/
├── src/
│   ├── components/        # Shared UI components
│   │   ├── ui/           # Shadcn components
│   │   ├── common/       # Buttons, inputs, cards
│   │   └── features/     # Feature-specific components
│   ├── features/         # Feature modules
│   │   ├── auth/
│   │   ├── map/
│   │   ├── chat/
│   │   ├── matches/
│   │   ├── friends/
│   │   └── profile/
│   ├── hooks/            # Custom hooks
│   ├── services/         # API calls
│   ├── store/            # Zustand stores
│   ├── routes/           # React Router setup
│   ├── utils/            # Helpers
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### State Management (Zustand)

**authStore**
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login, logout, register, checkAuth
}
```

**userStore**
```typescript
{
  currentUser: User | null,
  nearbyUsers: User[],
  updateProfile, updateLocation, likeUser
}
```

**chatStore**
```typescript
{
  conversations: Conversation[],
  activeChat: Match | null,
  messages: Message[],
  typingUsers: string[],
  sendMessage, markRead, setTyping
}
```

**matchStore**
```typescript
{
  matches: Match[],
  pendingMatches: Match[],
  createMatch, revealMatch, unmatch
}
```

**mapStore**
```typescript
{
  userLocation: [number, number],
  radius: number,
  markers: MapMarker[],
  selectedUser: User | null,
  setLocation, setRadius, setSelectedUser
}
```

### Real-time Architecture (Socket.io)

**Events (Client → Server)**
- `join` - Join user's room on connect
- `send_message` - Send a message
- `typing_start` / `typing_stop` - Typing indicators
- `mark_read` - Mark messages as read
- `location_update` - Update user location
- `go_online` / `go_offline` - Status changes

**Events (Server → Client)**
- `new_message` - Receive message
- `user_typing` - Another user typing
- `message_read` - Message read status update
- `new_match` - Match created
- `friend_request` - New friend request
- `user_online` / `user_offline` - Online status
- `location_changed` - Nearby user moved

### Security
- JWT tokens with 7d expiry
- Password hashing with bcrypt (12 rounds)
- Rate limiting: 100 requests/min general, 5 requests/min auth
- Input validation with Zod
- CORS configuration
- Helmet security headers
- MongoDB injection prevention
- XSS protection
ko
### Image Handling
- Multer for file uploads
- Cloudinary for storage
- Image compression and resizing
- Max 5MB per image
- Allowed: jpg, png, webp

## 7. Database Indexes

```javascript
// Users collection
{ location: "2dsphere" }           // Geospatial queries
{ email: 1 }                       // Unique email lookup
{ "likedUsers": 1 }               // Find who user liked
{ "matchedUsers": 1 }             // Find user's matches
{ "friends": 1 }                  // Find user's friends

// Messages collection
{ matchId: 1, createdAt: -1 }     // Chat history
{ senderId: 1, receiverId: 1 }    // Direct messages

// Matches collection
{ users: 1 }                      // Find matches by user
{ "users.userId": 1 }             // Compound index

// FriendRequests collection
{ receiverId: 1, status: 1 }     // Pending requests
{ senderId: 1 }                    // Sent requests
```
