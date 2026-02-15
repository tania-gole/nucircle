# NuCircle

A full-stack Q&A platform inspired by Stack Overflow, built with real-time collaboration features including multiplayer trivia games, community spaces, direct messaging, and a gamified points and badge system.

## About the Project

NuCircle was developed as a team project for **CS4530 - Software Engineering** at **Northeastern University** during **Fall 2025**. Over the course of ~5 weeks (October - November 2025), our team of four designed, built, and deployed a production-ready web application following agile development practices.

### Motivation

We wanted to go beyond a basic Q&A clone and build a platform that fosters genuine community engagement among students. The core idea was: what if Stack Overflow also had real-time trivia games, community spaces with streaks, and a points-based leaderboard to keep users coming back?

### Team

| Name | GitHub | Role |
|------|--------|------|
| **Tania Gole** | [@tania1308](https://github.com/tania1308) | Full-stack development |
| **Maya Robie** | [@mrobie8](https://github.com/mrobie8) | Full-stack development |
| **Angelina Zhang** | [@ayz122004](https://github.com/ayz122004) | Full-stack development |
| **Rae** | [@y-ra](https://github.com/y-ra) | Full-stack development |

## Features

### Q&A Platform
- Ask and answer questions with full-text search and tag-based filtering
- Sort by newest, unanswered, active, or most viewed
- Upvote/downvote system for questions and answers
- Threaded comments on questions and answers

### Real-Time Trivia Games
- Create or join multiplayer trivia quizzes (2 players)
- 10 randomized questions per round with live scoring
- Tiebreaker system for close matches
- Challenge other online users with quiz invitations (30-second accept window)
- Real-time game state sync via WebSocket

### Communities
- Create public or private community spaces
- Community-specific question feeds and messaging channels
- Visit streak tracking (current and longest)
- Member count and online status

### Collections
- Organize questions into public or private collections
- Save/unsave questions across the platform
- Browse and discover other users' collections

### Messaging
- Direct messages between users
- Community group messaging
- Message reactions (love, like)
- Online/offline presence indicators

### User Profiles & Gamification
- Customizable profiles with bio, career info, and external links (GitHub, LinkedIn, portfolio)
- Points system earned through platform activity
- Badge milestones (50/100 questions, 50/100 answers, community member, leaderboard placement)
- Global leaderboard with top-3 badges

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, React Router v7 |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB with Mongoose ODM |
| **Real-Time** | Socket.IO (WebSocket) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |
| **API Docs** | OpenAPI 3.0 + Swagger UI |
| **Testing** | Jest (unit/integration), Cypress (E2E) |
| **Deployment** | Render |

## Architecture

```
Client (React + Vite)
    |
    |--- HTTP (REST API) ---> Express.js Server
    |--- WebSocket ----------> Socket.IO Server
                                    |
                                    v
                              MongoDB Database
```

**Key architectural decisions:**
- **Controller -> Service -> Model** pattern for clean separation of concerns
- **Shared types package** between client and server for type safety across the stack
- **Socket.IO rooms** for scoped real-time broadcasts (game rooms, chat rooms, community channels)
- **OpenAPI validation middleware** that validates every request/response against the API spec
- **JWT authentication middleware** protecting all authenticated routes

## Project Structure

```
nucircle/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/   # UI components (auth, Q&A, games, communities, etc.)
│   │   ├── services/     # API client functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── contexts/     # React context providers
├── server/          # Express backend
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic
│   ├── models/           # Mongoose schemas
│   ├── middleware/        # Auth, validation
│   ├── socket/           # Socket.IO event handlers
│   ├── games/            # Game engine (trivia logic, game manager)
│   └── tests/            # Jest unit & integration tests
├── shared/          # Shared TypeScript type definitions
│   └── types/
└── testing/         # Cypress E2E test suite
    └── cypress/
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/tania-gole/nucircle.git
cd nucircle

# Install all dependencies (client, server, shared)
npm install
```

### Environment Setup

Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/nucircle
JWT_SECRET=your_secret_key
PORT=8000
CLIENT_URL=http://localhost:5173
```

### Running the App

```bash
# Terminal 1 - Start the server
cd server && npm run dev

# Terminal 2 - Start the client
cd client && npm run dev
```

The client runs at `http://localhost:5173` and the server at `http://localhost:8000`.

### API Documentation

With the server running, visit `http://localhost:8000/api/docs` for the interactive Swagger UI.

## Testing

### Unit & Integration Tests (Jest)

```bash
cd server && npm test
```

### End-to-End Tests (Cypress)

```bash
cd testing
npm install
npx cypress open
```

> Requires both client and server to be running.

## Timeline

| Week | Milestone |
|------|-----------|
| 1 | Project setup, authentication (signup/login/JWT), base Q&A functionality |
| 2 | Voting, comments, tags, search/filter, user profiles |
| 3 | Communities, collections, direct messaging, chat system |
| 4 | Trivia game engine, real-time multiplayer, quiz invitations, leaderboard & badges |
| 5 | Points system, UI polish, E2E testing, deployment to Render |

## License

This project is licensed under the BSD 3-Clause License. See [LICENSE](LICENSE) for details.
