import { Server, Socket } from 'socket.io';
import { updateUserOnlineStatus, getUserByUsername } from '../../services/user.service';
import QuizInvitationManager from '../../services/invitationManager.service';
import GameManager from '../../services/games/gameManager';
import { ObjectId } from 'mongodb';

// Mock all external dependencies
jest.mock('../../services/user.service');
jest.mock('../../services/invitationManager.service');
jest.mock('../../services/games/gameManager');

describe('Socket.IO Event Handlers', () => {
  let mockSocket: Partial<Socket>;
  let mockIo: Partial<Server>;
  let mockBroadcast: jest.Mock;
  let mockEmit: jest.Mock;
  let mockTo: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock socket.emit
    mockEmit = jest.fn();

    // Mock socket.broadcast.emit to send to all other sockets
    mockBroadcast = jest.fn();

    // Mock socket.to().emit
    mockTo = jest.fn().mockReturnValue({ emit: jest.fn() });

    // Create mock socket instance
    mockSocket = {
      id: 'socket_123abc',
      data: {},
      emit: mockEmit,
      broadcast: { emit: mockBroadcast } as any,
      to: mockTo,
      on: jest.fn(),
    };

    // Created the mock io instance
    mockIo = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };
  });

  describe('userConnect event', () => {
    it('should update user status to online and broadcast to other users', async () => {
      const username = 'test_user';
      const mockUser = {
        _id: new ObjectId(),
        username,
        firstName: 'Test',
        lastName: 'User',
        isOnline: true,
        socketId: 'socket_123abc',
      };

      (updateUserOnlineStatus as jest.Mock).mockResolvedValue(mockUser);

      // userConnect event handler
      const handler = async (user: string) => {
        const result = await updateUserOnlineStatus(user, true, mockSocket.id!);

        if ('error' in result) {
          mockSocket.emit!('error', { message: 'Failed to update online status' });
          return;
        }

        mockSocket.data.username = user;

        mockSocket.broadcast!.emit('userStatusUpdate', {
          username: user,
          isOnline: true,
        });
      };

      await handler(username);

      // Verify that updateUserOnlineStatus was called with correct params
      expect(updateUserOnlineStatus).toHaveBeenCalledWith(username, true, 'socket_123abc');

      // Verify that username stored in socket data
      expect(mockSocket.data.username).toBe(username);

      // Verify that status broadcast to other users
      expect(mockBroadcast).toHaveBeenCalledWith('userStatusUpdate', {
        username,
        isOnline: true,
      });
    });

    it('should emit error when status update fails', async () => {
      const username = 'test_user';

      // Mock failed status update
      (updateUserOnlineStatus as jest.Mock).mockResolvedValue({
        error: 'User not found',
      });

      // Simulate userConnect event handler
      const handler = async (user: string) => {
        const result = await updateUserOnlineStatus(user, true, mockSocket.id!);

        if ('error' in result) {
          mockSocket.emit!('error', { message: 'Failed to update online status' });
          return;
        }

        mockSocket.data.username = user;
        mockSocket.broadcast!.emit('userStatusUpdate', {
          username: user,
          isOnline: true,
        });
      };

      await handler(username);

      // Verify that error emitted to client
      expect(mockEmit).toHaveBeenCalledWith('error', {
        message: 'Failed to update online status',
      });

      // Verify that no broadcast occurred
      expect(mockBroadcast).not.toHaveBeenCalled();
    });
  });

  describe('sendQuizInvite event', () => {
    const challengerUsername = 'test_userA';
    const recipientUsername = 'test_userB';

    beforeEach(() => {
      mockSocket.data.username = challengerUsername;
    });

    it('should send quiz invite when recipient is online', async () => {
      const mockRecipient = {
        _id: new ObjectId(),
        username: recipientUsername,
        isOnline: true,
        socketId: 'socket_456',
      };

      const mockInvite = {
        id: 'invite_123',
        challengerUsername,
        challengerSocketId: 'socket_123abc',
        recipientUsername,
        recipientSocketId: 'socket_456',
      };

      // Mock recipient lookup
      (getUserByUsername as jest.Mock).mockResolvedValue(mockRecipient);

      // Mock invitation manager
      const mockInvitationManager = {
        hasPendingInvitation: jest.fn().mockReturnValue(false),
        createInvitation: jest.fn().mockReturnValue(mockInvite),
      };
      (QuizInvitationManager.getInstance as jest.Mock).mockReturnValue(mockInvitationManager);

      // Simulate sendQuizInvite handler
      const handler = async (recipient: string) => {
        const challenger = mockSocket.data.username;

        if (!challenger) {
          mockSocket.emit!('error', { message: 'Cannot send invite: user not authenticated' });
          return;
        }

        const recipientUser = await getUserByUsername(recipient);
        if ('error' in recipientUser) {
          mockSocket.emit!('error', { message: 'Recipient not found' });
          return;
        }

        if (!recipientUser.isOnline || !recipientUser.socketId) {
          mockSocket.emit!('error', { message: 'Recipient is not online' });
          return;
        }

        const invitationManager = QuizInvitationManager.getInstance();

        if (invitationManager.hasPendingInvitation(recipient, challenger)) {
          mockSocket.emit!('error', { message: 'Invitation already sent' });
          return;
        }

        const invite = invitationManager.createInvitation(
          challenger,
          mockSocket.id!,
          recipient,
          recipientUser.socketId,
        );

        const recipientSocket = mockSocket.to!(recipientUser.socketId);
        recipientSocket.emit('quizInviteReceived', invite);
      };

      await handler(recipientUsername);

      // Verify that recipient lookup
      expect(getUserByUsername).toHaveBeenCalledWith(recipientUsername);

      // Verify that invitation created
      expect(mockInvitationManager.createInvitation).toHaveBeenCalledWith(
        challengerUsername,
        'socket_123abc',
        recipientUsername,
        'socket_456',
      );

      // Verify that invite sent to recipient's socket
      expect(mockTo).toHaveBeenCalledWith('socket_456');
    });

    it('should emit error when user not authenticated', async () => {
      // Clear username (unauthenticated)
      mockSocket.data.username = undefined;

      const handler = async (recipient: string) => {
        const challenger = mockSocket.data.username;

        if (!challenger) {
          mockSocket.emit!('error', { message: 'Cannot send invite: user not authenticated' });
          return;
        }
      };

      await handler(recipientUsername);

      expect(mockEmit).toHaveBeenCalledWith('error', {
        message: 'Cannot send invite: user not authenticated',
      });
    });

    it('should emit error when recipient not found', async () => {
      (getUserByUsername as jest.Mock).mockResolvedValue({ error: 'User not found' });

      const handler = async (recipient: string) => {
        const challenger = mockSocket.data.username;

        if (!challenger) {
          mockSocket.emit!('error', { message: 'Cannot send invite: user not authenticated' });
          return;
        }

        const recipientUser = await getUserByUsername(recipient);
        if ('error' in recipientUser) {
          mockSocket.emit!('error', { message: 'Recipient not found' });
          return;
        }
      };

      await handler(recipientUsername);

      expect(mockEmit).toHaveBeenCalledWith('error', { message: 'Recipient not found' });
    });

    it('should emit error when recipient is offline', async () => {
      const mockRecipient = {
        _id: new ObjectId(),
        username: recipientUsername,
        isOnline: false,
        socketId: null,
      };

      (getUserByUsername as jest.Mock).mockResolvedValue(mockRecipient);

      const handler = async (recipient: string) => {
        const challenger = mockSocket.data.username;

        if (!challenger) {
          mockSocket.emit!('error', { message: 'Cannot send invite: user not authenticated' });
          return;
        }

        const recipientUser = await getUserByUsername(recipient);
        if ('error' in recipientUser) {
          mockSocket.emit!('error', { message: 'Recipient not found' });
          return;
        }

        if (!recipientUser.isOnline || !recipientUser.socketId) {
          mockSocket.emit!('error', { message: 'Recipient is not online' });
          return;
        }
      };

      await handler(recipientUsername);

      expect(mockEmit).toHaveBeenCalledWith('error', { message: 'Recipient is not online' });
    });

    it('should emit error when duplicate invitation exists', async () => {
      const mockRecipient = {
        _id: new ObjectId(),
        username: recipientUsername,
        isOnline: true,
        socketId: 'socket_456',
      };

      (getUserByUsername as jest.Mock).mockResolvedValue(mockRecipient);

      const mockInvitationManager = {
        hasPendingInvitation: jest.fn().mockReturnValue(true),
      };
      (QuizInvitationManager.getInstance as jest.Mock).mockReturnValue(mockInvitationManager);

      const handler = async (recipient: string) => {
        const challenger = mockSocket.data.username;

        if (!challenger) {
          mockSocket.emit!('error', { message: 'Cannot send invite: user not authenticated' });
          return;
        }

        const recipientUser = await getUserByUsername(recipient);
        if ('error' in recipientUser) {
          mockSocket.emit!('error', { message: 'Recipient not found' });
          return;
        }

        if (!recipientUser.isOnline || !recipientUser.socketId) {
          mockSocket.emit!('error', { message: 'Recipient is not online' });
          return;
        }

        const invitationManager = QuizInvitationManager.getInstance();

        if (invitationManager.hasPendingInvitation(recipient, challenger)) {
          mockSocket.emit!('error', { message: 'Invitation already sent' });
          return;
        }
      };

      await handler(recipientUsername);

      expect(mockEmit).toHaveBeenCalledWith('error', { message: 'Invitation already sent' });
    });
  });

  describe('respondToQuizInvite event: ACCEPTED', () => {
    it('should create game and notify both players when invitation accepted', async () => {
      const inviteId = 'invite_123';
      const mockInvite = {
        id: inviteId,
        challengerUsername: 'test_userA',
        challengerSocketId: 'socket_123',
        recipientUsername: 'test_userB',
        recipientSocketId: 'socket_456',
      };

      const mockInvitationManager = {
        getInvitation: jest.fn().mockReturnValue(mockInvite),
        updateInvitationStatus: jest.fn(),
        removeInvitation: jest.fn(),
      };
      (QuizInvitationManager.getInstance as jest.Mock).mockReturnValue(mockInvitationManager);

      const mockGameManager = {
        addGame: jest.fn().mockResolvedValue('game_789'),
        joinGame: jest.fn().mockResolvedValue(undefined),
        startGame: jest.fn().mockResolvedValue(undefined),
      };
      (GameManager.getInstance as jest.Mock).mockReturnValue(mockGameManager);

      // Simulate respondToQuizInvite handler
      const handler = async (invId: string, accepted: boolean) => {
        const invitationManager = QuizInvitationManager.getInstance();
        const invite = invitationManager.getInvitation(invId);

        if (!invite) {
          mockSocket.emit!('error', { message: 'Invitation not found or expired' });
          return;
        }

        const result: any = {
          inviteId: invite.id,
          challengerUsername: invite.challengerUsername,
          recipientUsername: invite.recipientUsername,
          accepted,
        };

        if (accepted) {
          const gameManager = GameManager.getInstance();
          const gameIdResult = await gameManager.addGame('Trivia', invite.challengerUsername);

          if (typeof gameIdResult === 'string') {
            const gameId = gameIdResult;

            await gameManager.joinGame(gameId, invite.challengerUsername);
            await gameManager.joinGame(gameId, invite.recipientUsername);
            await gameManager.startGame(gameId);

            result.gameId = gameId;

            invitationManager.updateInvitationStatus(invId, 'accepted');

            mockIo.to!(invite.challengerSocketId).emit('quizInviteAccepted', result);
            mockIo.to!(invite.recipientSocketId).emit('quizInviteAccepted', result);
          } else {
            mockSocket.emit!('error', { message: 'Failed to create game' });
            return;
          }
        }

        invitationManager.removeInvitation(invId);
      };

      await handler(inviteId, true);

      // Verify game creation
      expect(mockGameManager.addGame).toHaveBeenCalledWith('Trivia', 'test_userA');
      expect(mockGameManager.joinGame).toHaveBeenCalledWith('game_789', 'test_userA');
      expect(mockGameManager.joinGame).toHaveBeenCalledWith('game_789', 'test_userB');
      expect(mockGameManager.startGame).toHaveBeenCalledWith('game_789');

      // Verify invitation status updated
      expect(mockInvitationManager.updateInvitationStatus).toHaveBeenCalledWith(
        inviteId,
        'accepted',
      );

      // Verify invitation removed
      expect(mockInvitationManager.removeInvitation).toHaveBeenCalledWith(inviteId);
    });

    it('should emit error when game creation fails', async () => {
      const inviteId = 'invite_123';
      const mockInvite = {
        id: inviteId,
        challengerUsername: 'test_userA',
        challengerSocketId: 'socket_123',
        recipientUsername: 'test_userB',
        recipientSocketId: 'socket_456',
      };

      const mockInvitationManager = {
        getInvitation: jest.fn().mockReturnValue(mockInvite),
      };
      (QuizInvitationManager.getInstance as jest.Mock).mockReturnValue(mockInvitationManager);

      const mockGameManager = {
        addGame: jest.fn().mockResolvedValue({ error: 'Database error' }),
      };
      (GameManager.getInstance as jest.Mock).mockReturnValue(mockGameManager);

      const handler = async (invId: string, accepted: boolean) => {
        const invitationManager = QuizInvitationManager.getInstance();
        const invite = invitationManager.getInvitation(invId);

        if (!invite) {
          mockSocket.emit!('error', { message: 'Invitation not found or expired' });
          return;
        }

        if (accepted) {
          const gameManager = GameManager.getInstance();
          const gameIdResult = await gameManager.addGame('Trivia', invite.challengerUsername);

          if (typeof gameIdResult === 'string') {
            // Game created successfully
          } else {
            mockSocket.emit!('error', { message: 'Failed to create game' });
            return;
          }
        }
      };

      await handler(inviteId, true);

      expect(mockEmit).toHaveBeenCalledWith('error', { message: 'Failed to create game' });
    });
  });

  describe('respondToQuizInvite event: DECLINED', () => {
    it('should notify both players when invitation declined', async () => {
      const inviteId = 'invite_123';
      const mockInvite = {
        id: inviteId,
        challengerUsername: 'test_userA',
        challengerSocketId: 'socket_123',
        recipientUsername: 'test_userB',
        recipientSocketId: 'socket_456',
      };

      const mockInvitationManager = {
        getInvitation: jest.fn().mockReturnValue(mockInvite),
        updateInvitationStatus: jest.fn(),
        removeInvitation: jest.fn(),
      };
      (QuizInvitationManager.getInstance as jest.Mock).mockReturnValue(mockInvitationManager);

      const handler = async (invId: string, accepted: boolean) => {
        const invitationManager = QuizInvitationManager.getInstance();
        const invite = invitationManager.getInvitation(invId);

        if (!invite) {
          mockSocket.emit!('error', { message: 'Invitation not found or expired' });
          return;
        }

        const result: any = {
          inviteId: invite.id,
          challengerUsername: invite.challengerUsername,
          recipientUsername: invite.recipientUsername,
          accepted,
        };

        if (!accepted) {
          invitationManager.updateInvitationStatus(invId, 'declined');

          mockIo.to!(invite.challengerSocketId).emit('quizInviteDeclined', result);
          mockIo.to!(invite.recipientSocketId).emit('quizInviteDeclined', result);
        }

        invitationManager.removeInvitation(invId);
      };

      await handler(inviteId, false);

      // Verify that invitation status updated
      expect(mockInvitationManager.updateInvitationStatus).toHaveBeenCalledWith(
        inviteId,
        'declined',
      );

      // Verify that invitation removed
      expect(mockInvitationManager.removeInvitation).toHaveBeenCalledWith(inviteId);
    });

    it('should emit error when invitation not found', async () => {
      const inviteId = 'invalid_invite';

      const mockInvitationManager = {
        getInvitation: jest.fn().mockReturnValue(null),
      };
      (QuizInvitationManager.getInstance as jest.Mock).mockReturnValue(mockInvitationManager);

      const handler = async (invId: string, accepted: boolean) => {
        const invitationManager = QuizInvitationManager.getInstance();
        const invite = invitationManager.getInvitation(invId);

        if (!invite) {
          mockSocket.emit!('error', { message: 'Invitation not found or expired' });
          return;
        }
      };

      await handler(inviteId, false);

      expect(mockEmit).toHaveBeenCalledWith('error', {
        message: 'Invitation not found or expired',
      });
    });
  });

  describe('disconnect event', () => {
    it('should update user offline status and broadcast when user disconnects', async () => {
      const username = 'test_user';
      mockSocket.data.username = username;

      const mockUser = {
        _id: new ObjectId(),
        username,
        isOnline: false,
        socketId: null,
        lastSeen: new Date(),
      };

      (updateUserOnlineStatus as jest.Mock).mockResolvedValue(mockUser);

      const mockGameManager = {
        getGamesByPlayer: jest.fn().mockResolvedValue([]),
      };
      (GameManager.getInstance as jest.Mock).mockReturnValue(mockGameManager);

      // Simulate disconnect handler
      const handler = async () => {
        const user = mockSocket.data.username;

        if (!user) {
          return;
        }

        const gameManager = GameManager.getInstance();
        await gameManager.getGamesByPlayer(user);

        const result = await updateUserOnlineStatus(user, false, null);

        if ('error' in result) {
          return;
        }

        mockSocket.broadcast!.emit('userStatusUpdate', {
          username: user,
          isOnline: false,
          lastSeen: new Date(),
        });
      };

      await handler();

      // Verify that status updated to offline
      expect(updateUserOnlineStatus).toHaveBeenCalledWith(username, false, null);

      // Verify that broadcast to other users
      expect(mockBroadcast).toHaveBeenCalledWith('userStatusUpdate', {
        username,
        isOnline: false,
        lastSeen: expect.any(Date),
      });
    });

    it('should handle active games and notify opponent when they have disconnected', async () => {
      const username = 'gole.t';
      const opponentUsername = 'robie.m';
      mockSocket.data.username = username;

      const mockGame = {
        gameID: 'game_123',
        players: ['gole.t', 'robie.m'],
        state: { status: 'IN_PROGRESS' },
      };

      const mockOpponent = {
        username: opponentUsername,
        socketId: 'socket_456',
      };

      const mockUpdatedGame = {
        toModel: jest.fn().mockReturnValue({ gameID: 'game_123', winner: 'robie.m' }),
      };

      const mockGameManager = {
        getGamesByPlayer: jest.fn().mockResolvedValue([mockGame]),
        endGameByDisconnect: jest.fn().mockResolvedValue(undefined),
        getGame: jest.fn().mockReturnValue(mockUpdatedGame),
      };
      (GameManager.getInstance as jest.Mock).mockReturnValue(mockGameManager);
      (getUserByUsername as jest.Mock).mockResolvedValue(mockOpponent);
      (updateUserOnlineStatus as jest.Mock).mockResolvedValue({ username, isOnline: false });

      const handler = async () => {
        const user = mockSocket.data.username;

        if (!user) {
          return;
        }

        const gameManager = GameManager.getInstance();
        const userGames = await gameManager.getGamesByPlayer(user);

        for (const game of userGames) {
          if (game.state.status === 'IN_PROGRESS' || game.state.status === 'WAITING_TO_START') {
            const otherPlayer = game.players.find((p: string) => p !== user);

            if (otherPlayer) {
              await gameManager.endGameByDisconnect(game.gameID, user, otherPlayer);

              const otherUser = await getUserByUsername(otherPlayer);
              if (!('error' in otherUser) && otherUser.socketId) {
                const updatedGame = gameManager.getGame(game.gameID);

                if (updatedGame) {
                  mockIo.to!(otherUser.socketId).emit('gameUpdate', {
                    gameInstance: updatedGame.toModel(),
                  });

                  mockIo.to!(otherUser.socketId).emit('opponentDisconnected', {
                    gameId: game.gameID,
                    disconnectedPlayer: user,
                    winner: otherPlayer,
                    message: `${user} disconnected. You win by default!`,
                  });
                }
              }
            }
          }
        }

        await updateUserOnlineStatus(user, false, null);
      };

      await handler();

      // Verify game ended
      expect(mockGameManager.endGameByDisconnect).toHaveBeenCalledWith(
        'game_123',
        username,
        opponentUsername,
      );

      // Verify opponent lookup
      expect(getUserByUsername).toHaveBeenCalledWith(opponentUsername);
    });

    it('should do nothing when anonymous socket disconnects', async () => {
      // No username in socket.data
      mockSocket.data.username = undefined;

      const handler = async () => {
        const user = mockSocket.data.username;

        if (!user) {
          return;
        }

        await updateUserOnlineStatus(user, false, null);
      };

      await handler();

      // Verify that no database call
      expect(updateUserOnlineStatus).not.toHaveBeenCalled();
    });
  });
});
