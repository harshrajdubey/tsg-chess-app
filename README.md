# Real-Time Multiplayer Chess Platform

## 1️⃣ Project Overview

**Chess Platform** is a modern, high-performance real-time multiplayer chess application built for seamless competitive play. It solves the problem of reliable, low-latency chess matchmaking and gameplay handling in a distributed environment.

**Key Features:**
- **Real-time Multiplayer:** Instant move updates using WebSockets with optimistic UI updates
- **Matchmaking System:** Intelligent queuing system that pairs players based on rating and time controls (Bullet, Blitz, Rapid)
- **Play vs Computer:** Integrated Stockfish engine with adaptive difficulty based on player rating
- **In-Game Chat:** Real-time messaging between players during games
- **Pro Performance:** Optimized for low latency with incremental state updates
- **Elo Rating System:** Full implementation of the Elo rating algorithm
- **Game History & Analytics:** Persistent storage of past games with detailed result tracking
- **PostgreSQL + Redis:** PostgreSQL for persistent data, Redis for real-time game state

## 2️⃣ Folder & File Structure

### Client (`/client`)
Built with React, TypeScript, and Vite for a lightning-fast frontend experience.

```
client/
├── src/
│   ├── pages/           # High-level application views
│   │   ├── Game.tsx         # Main gameplay interface (board, timer, chat)
│   │   ├── ComputerGame.tsx # Play against Stockfish
│   │   ├── Matchmaking.tsx  # Queue interface and mode selection
│   │   ├── Profile.tsx      # User stats, history, and settings
│   │   └── Login.tsx        # Authentication forms
│   ├── components/      # Reusable UI building blocks
│   │   ├── ui/              # Atomic visual components (Buttons, Cards, Inputs)
│   │   └── chess/           # Chess-specific components (Board, Panel)
│   ├── hooks/           # Custom React hooks
│   │   ├── use-auth.ts      # User session management
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/             # Core utilities
│   │   └── api.ts           # REST API client wrapper
│   └── context/         # Global state providers
│       └── SocketContext.tsx # WebSocket connection abstraction
├── .env.example         # Environment variables template
```

### Backend (`/unified-backend`)
A unified Node.js/Express server handling API requests, WebSocket events, and game logic.

```
unified-backend/
├── src/
│   ├── repositories/    # Data access layer (PostgreSQL)
│   │   ├── UserRepository.js       # User CRUD operations
│   │   └── GameHistoryRepository.js # Game history storage
│   ├── routes/          # REST API Endpoints
│   │   ├── auth.js          # JWT authentication
│   │   ├── games.js         # Game controls (resign, timeout)
│   │   ├── computer.js      # Computer game endpoints
│   │   └── matchmaking.js   # Queue management
│   ├── services/        # Core Business Logic
│   │   ├── game-service.js         # Rules enforcement, state updates
│   │   ├── socket-service.js       # Real-time events (moves, chat)
│   │   ├── matchmaking-service.js  # Queue management and pairing
│   │   └── stockfish-service.js    # Stockfish integration
│   ├── lib/             # Shared Libraries
│   │   ├── db.js            # PostgreSQL + Redis connections
│   │   └── rating.js        # Elo calculation algorithms
│   └── index.js         # Server entry point
├── migrations/          # Database migrations
│   └── init.sql         # Initial schema (users, game_history)
├── .env.example         # Environment variables template
```

## 3️⃣ How to Run the Project

### Prerequisites
- **Node.js** (v18+)
- **Docker & Docker Compose** (for PostgreSQL and Redis)
- **Stockfish** (optional, for computer games - install via `apt install stockfish` or download from stockfishchess.org)

### Environment Setup

1. **Start the databases:**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL (port 5433) and Redis (port 6379) with persistent volumes.

2. **Configure backend environment:**
   ```bash
   cd unified-backend
   cp .env.example .env
   # Edit .env if needed (defaults work for local development)
   ```

3. **Configure frontend environment:**
   ```bash
   cd client
   cp .env.example .env
   # Edit .env if deploying (defaults work for local development)
   ```

### Step-by-Step Startup

1.  **Install dependencies & Start the Backend**
    ```bash
    cd unified-backend
    npm install
    npm run dev
    ```
    *Output should confirm: "Connected to PostgreSQL", "Connected to Redis", "Server running on port 3001"*

2.  **Start the Frontend**
    ```bash
    cd client
    npm install
    npm run dev
    ```
    *Output should show local server link: http://localhost:8080*

3.  **Play!**
    Open `http://localhost:8080` in two different browser windows (or incognito) to simulate two players.

## 4️⃣ How the Game Works (Runtime Flow)

1.  **Authentication:** User registers/logs in -> Server issues JWT -> Client stores token.
2.  **Matchmaking:** User selects mode (e.g., Blitz) -> Client sends request -> Backend adds user to Redis Queue.
3.  **Pairing:** Interval runs every 1s -> Checks queue -> Pairs users with similar ELO -> Creates Game ID -> Emits `match_found`.
4.  **Game Initialization:** Clients receive Game ID -> Connect to Socket Room `game:{id}` -> Fetch initial state.
5.  **Gameplay:**
    *   Player A makes move -> Client applies move **optimistically** (instant UI update) -> Emits `move` event.
    *   Server validates move (chess.js) -> Updates Redis state -> Broadcasts `move_made` (incremental) & `game_state`.
    *   Player B receives update -> Board syncs automatically.
    *   If move was invalid, Player A receives `move_error` and board reverts.
6.  **Chat:** Players can send messages via `chat_message` event -> Stored in Redis -> Broadcast to room.
7.  **Game Over:** Checkmate/Resign/Timeout/Draw -> Server calculates result -> Updates PostgreSQL -> Broadcasts `game_over`.
8.  **Post-Game:** Modal appears with result and rating change.

### Computer Game Flow
1.  User selects "Play Computer" with difficulty (easy/normal/hard).
2.  Backend creates game, calculates appropriate Stockfish level from user's rating.
3.  User makes move -> Backend validates -> Stockfish calculates response -> Both moves returned.
4.  Game ends -> Result shown (no rating changes for computer games).

## 5️⃣ WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client -> Server | Authenticate with JWT |
| `join_game` | Client -> Server | Join a game room |
| `move` | Client -> Server | Send a chess move |
| `move_made` | Server -> Client | Incremental move update |
| `game_state` | Server -> Client | Full game state |
| `move_error` | Server -> Client | Invalid move error |
| `game_over` | Server -> Client | Game ended |
| `chat_message` | Bidirectional | In-game chat |
| `typing_start` | Client -> Server | Typing indicator |
| `offer_draw` | Client -> Server | Offer a draw |
| `draw_offered` | Server -> Client | Draw offer received |
| `match_found` | Server -> Client | Matchmaking success |

## 6️⃣ Tech Stack

**Frontend:**
*   React 18 + TypeScript
*   Vite (Build Tool)
*   TailwindCSS (Styling)
*   Shadcn/UI (Component Library)
*   Chess.js / Custom ChessBoard
*   Socket.IO Client

**Backend:**
*   Node.js + Express
*   Socket.IO (WebSockets)
*   PostgreSQL (pg) - Persistent data
*   Redis (ioredis) - Real-time state
*   Stockfish - Chess engine

**Infrastructure:**
*   Docker Compose (PostgreSQL + Redis)

## 7️⃣ Environment Variables

### Backend (`unified-backend/.env`)
```env
PORT=3001
DATABASE_URL=postgresql://chess_user:chess_password_secure@localhost:5433/chess_platform
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_key
CORS_ORIGIN=http://localhost:8080,http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_BASE_URL=http://localhost:3001
```

## 8️⃣ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| user_id | VARCHAR | Unique user identifier |
| username | VARCHAR | Display name |
| email | VARCHAR | Email address |
| password | VARCHAR | Bcrypt hash |
| bullet/blitz/rapid | INTEGER | Ratings per time control |
| games_played | INTEGER | Total games |
| games_won | INTEGER | Wins |

### Game History Table
| Column | Type | Description |
|--------|------|-------------|
| game_id | VARCHAR | Unique game identifier |
| user_id | VARCHAR | Player reference |
| opponent_user_id | VARCHAR | Opponent reference |
| result | ENUM | won/lost/draw |
| rating_change | INTEGER | Elo change |
| time_control | VARCHAR | bullet/blitz/rapid |
| moves | JSONB | Move history |

## 9️⃣ Future Improvements

-   **Spectator Mode:** Allow users to watch live games
-   **Engine Analysis:** Post-game analysis with Stockfish
-   **Rematch System:** Quick rematch with same opponent
-   **Tournament Mode:** Bracket-style tournaments
-   **Mobile App:** React Native port
