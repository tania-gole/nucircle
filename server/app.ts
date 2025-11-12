/* eslint no-console: "off" */

// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
// startServer() is a function that starts the server
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import * as http from 'http';
import * as OpenApiValidator from 'express-openapi-validator';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import * as fs from 'fs';

import answerController from './controllers/answer.controller';
import questionController from './controllers/question.controller';
import tagController from './controllers/tag.controller';
import commentController from './controllers/comment.controller';
import { FakeSOSocket } from './types/types';
import userController from './controllers/user.controller';
import messageController from './controllers/message.controller';
import chatController from './controllers/chat.controller';
import gameController from './controllers/game.controller';
import collectionController from './controllers/collection.controller';
import communityController from './controllers/community.controller';
import { updateUserOnlineStatus, getUserByUsername } from './services/user.service';
import communityMessagesController from './controllers/communityMessagesController';
import badgeController from './controllers/badge.controller';
// import authMiddleware from './middleware/auth';
import authMiddleware from './middleware/auth';
import QuizInvitationManager from './services/invitationManager.service';
import GameManager from './services/games/gameManager';

const MONGO_URL = `${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'}/fake_so`;
const PORT = parseInt(process.env.PORT || '8000');

const app = express();
const server = http.createServer(app);
// allow requests from the local dev client or the production client only
const io: FakeSOSocket = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.CLIENT_URL || [
      'http://localhost:4530',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
  },
});

function connectDatabase() {
  return mongoose.connect(MONGO_URL).catch(err => console.log('MongoDB connection error: ', err));
}

function startServer() {
  connectDatabase();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// CODE CHANGE
io.on('connection', socket => {
  console.log('A user connected ->', socket.id);

  // Listen for userConnect event: client sends this after successful login
  socket.on('userConnect', async (username: string) => {
    console.log(`User ${username} connected with socket ${socket.id}`);

    // Update the database: set user online, store their socket ID for real-time messaging
    const result = await updateUserOnlineStatus(username, true, socket.id);

    if ('error' in result) {
      console.error('Error updating user status:', result.error);
      return;
    }

    // Store username in socket instance
    socket.data.username = username;

    socket.broadcast.emit('userStatusUpdate', {
      username,
      isOnline: true,
    });

    // Notify all connected clients that this user came online
    console.log(`User ${username} is online`);
  });

  socket.on('sendQuizInvite', async (recipientUsername: string) => {
    const challengerUsername = socket.data.username;

    if (!challengerUsername) {
      console.error('Cannot send invite: user not authenticated');
      return;
    }

    console.log(`Quiz invite: ${challengerUsername} → ${recipientUsername}`);

    // Check if user is online
    const recipientUser = await getUserByUsername(recipientUsername);
    if ('error' in recipientUser) {
      socket.emit('error', { message: 'Recipient not found' });
      return;
    }

    if (!recipientUser.isOnline || !recipientUser.socketId) {
      socket.emit('error', { message: 'Recipient is not online' });
      return;
    }

    const invitationManager = QuizInvitationManager.getInstance();

    // Prevent duplicate invitations
    if (invitationManager.hasPendingInvitation(recipientUsername, challengerUsername)) {
      socket.emit('error', { message: 'Invitation already sent' });
      return;
    }

    // Create invitation
    const invite = invitationManager.createInvitation(
      challengerUsername,
      socket.id,
      recipientUsername,
      recipientUser.socketId,
    );

    // Send invitation to recipient via their socket
    socket.to(recipientUser.socketId).emit('quizInviteReceived', invite);

    console.log(`Invitation ${invite.id} sent to ${recipientUsername}`);
  });

  // Respond to Invitation
  socket.on('respondToQuizInvite', async (inviteId: string, accepted: boolean) => {
    console.log(`Invitation ${inviteId} response: ${accepted ? 'ACCEPTED' : 'DECLINED'}`);

    const invitationManager = QuizInvitationManager.getInstance();
    const invite = invitationManager.getInvitation(inviteId);

    if (!invite) {
      console.error('Invitation not found:', inviteId);
      return;
    }

    const result: {
      inviteId: string;
      challengerUsername: string;
      recipientUsername: string;
      accepted: boolean;
      gameId?: string;
    } = {
      inviteId: invite.id,
      challengerUsername: invite.challengerUsername,
      recipientUsername: invite.recipientUsername,
      accepted,
    };

    if (accepted) {
      // Create a new trivia game
      const gameManager = GameManager.getInstance();
      const gameIdResult = await gameManager.addGame('Trivia', invite.challengerUsername);

      if (typeof gameIdResult === 'string') {
        // Game created successfully
        const gameId = gameIdResult;

        // Join both players to the game
        await gameManager.joinGame(gameId, invite.challengerUsername);
        await gameManager.joinGame(gameId, invite.recipientUsername);

        // Start the game
        await gameManager.startGame(gameId);

        result.gameId = gameId;

        // Update invitation status
        invitationManager.updateInvitationStatus(inviteId, 'accepted');

        // Notify both players with gameId
        io.to(invite.challengerSocketId).emit('quizInviteAccepted', result);
        io.to(invite.recipientSocketId).emit('quizInviteAccepted', result);

        console.log(`Game ${gameId} created and started for invitation ${inviteId}`);
      } else {
        console.error('Failed to create game:', gameIdResult.error);
        socket.emit('error', { message: 'Failed to create game' });
        return;
      }
    } else {
      // Invitation declined
      invitationManager.updateInvitationStatus(inviteId, 'declined');

      // Notify both users
      io.to(invite.challengerSocketId).emit('quizInviteDeclined', result);
      io.to(invite.recipientSocketId).emit('quizInviteDeclined', result);
    }

    // Clean up invitation from memory
    invitationManager.removeInvitation(inviteId);
  });

  // Listen for disconnect event: when user logs out, closes browser, or loses connection
  socket.on('disconnect', async () => {
    console.log('User disconnected');

    // Same username stored above - retrieve this
    const username = socket.data.username;

    if (username) {
      console.log(`User ${username} disconnecting...`);

      const result = await updateUserOnlineStatus(username, false, null);

      if ('error' in result) {
        console.error('Error updating user status:', result.error);
        return;
      }

      // Notify all connected clients that this user went offline
      socket.broadcast.emit('userStatusUpdate', {
        username,
        isOnline: false,
        lastSeen: new Date(),
      });

      console.log(`User ${username} is offline`);
    }
  });
});

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  io.close();

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

app.use(express.json());

try {
  app.use(
    OpenApiValidator.middleware({
      apiSpec: './openapi.yaml',
      validateRequests: true,
      validateResponses: false, // FOR DEVELOPMENT ONLY - set to true in production
      ignoreUndocumented: true, // Only validate paths defined in the spec
      formats: {
        'object-id': (v: string) => /^[0-9a-fA-F]{24}$/.test(v),
      },
    }),
  );

  // Custom Error Handler for express-openapi-validator errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Format error response for validation errors
    if (err.status && err.errors) {
      res.status(err.status).json({
        message: 'Request Validation Failed',
        errors: err.errors,
      });
    } else {
      next(err); // Pass through other errors
    }
  });
} catch (e) {
  console.error('Failed to load or initialize OpenAPI Validator:', e);
}

app.use('/api/user', userController(io));

const openApiDocument = yaml.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
console.log('Swagger UI is available at /api/docs');

app.use(authMiddleware); // Protect routes below this line

app.use('/api/question', questionController(io));
app.use('/api/tags', tagController());
app.use('/api/answer', answerController(io));
app.use('/api/comment', commentController(io));
app.use('/api/message', messageController(io));
app.use('/api/chat', chatController(io));
app.use('/api/games', gameController(io));
app.use('/api/collection', collectionController(io));
app.use('/api/community', communityController(io));
app.use('/api/community/messages', communityMessagesController(io));
app.use('/api/badge', badgeController(io));

// Export the app instance
export { app, server, startServer };
