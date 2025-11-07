import GameModel from '../../../models/games.model';
import TriviaGame from '../../../services/games/trivia';
import { GameInstance, TriviaGameState } from '../../../types/types';

describe('TriviaGame tests', () => {
  let triviaGame: TriviaGame;

  beforeEach(() => {
    triviaGame = new TriviaGame('testUser');
  });

  describe('constructor', () => {
    it('creates a blank game', () => {
      expect(triviaGame.id).toBeDefined();
      expect(triviaGame.id).toEqual(expect.any(String));
      expect(triviaGame.state.status).toBe('WAITING_TO_START');
      expect(triviaGame.state.player1).toBeUndefined();
      expect(triviaGame.state.player2).toBeUndefined();
      expect(triviaGame.state.winners).toBeUndefined();
      expect(triviaGame.gameType).toEqual('Trivia');
    });
  });

  describe('toModel', () => {
    it('should return a representation of the current game state', () => {
      const gameState: GameInstance<TriviaGameState> = {
        state: {
          status: 'WAITING_TO_START',
          currentQuestionIndex: 0,
          questions: [],
          player1Answers: [],
          player2Answers: [],
          player1Score: 0,
          player2Score: 0,
        },
        gameID: expect.any(String),
        players: [],
        gameType: 'Trivia',
      };

      expect(triviaGame.toModel()).toEqual(gameState);
    });

    it('should return a representation of the current game state', () => {
      const gameState1: GameInstance<TriviaGameState> = {
        state: {
          status: 'WAITING_TO_START',
          player1: 'player1',
          currentQuestionIndex: 0,
          questions: [],
          player1Answers: [],
          player2Answers: [],
          player1Score: 0,
          player2Score: 0,
        },
        gameID: expect.any(String),
        players: ['player1'],
        gameType: 'Trivia',
      };

      const gameState2: GameInstance<TriviaGameState> = {
        state: {
          status: 'IN_PROGRESS',
          player1: 'player1',
          player2: 'player2',
          currentQuestionIndex: 0,
          questions: [],
          player1Answers: [],
          player2Answers: [],
          player1Score: 0,
          player2Score: 0,
        },
        gameID: expect.any(String),
        players: ['player1', 'player2'],
        gameType: 'Trivia',
      };

      const gameState3: GameInstance<TriviaGameState> = {
        state: {
          status: 'OVER',
          player1: undefined,
          player2: 'player2',
          winners: ['player2'],
          currentQuestionIndex: 0,
          questions: [],
          player1Answers: [],
          player2Answers: [],
          player1Score: 0,
          player2Score: 0,
        },
        gameID: expect.any(String),
        players: ['player2'],
        gameType: 'Trivia',
      };

      triviaGame.join('player1');

      expect(triviaGame.toModel()).toEqual(gameState1);

      triviaGame.join('player2');

      expect(triviaGame.toModel()).toEqual(gameState2);

      triviaGame.leave('player1');

      expect(triviaGame.toModel()).toEqual(gameState3);
    });
  });

  describe('join', () => {
    it('adds player1 to the game', () => {
      expect(triviaGame.state.player1).toBeUndefined();

      triviaGame.join('player1');

      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');
    });

    it('adds player2 to the game and sets the game status to IN_PROGRESS', () => {
      // assemble
      triviaGame.join('player1');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');

      // act
      triviaGame.join('player2');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('IN_PROGRESS');
    });

    it('throws an error if trying to join an in progress game', () => {
      // assemble
      triviaGame.join('player1');
      triviaGame.join('player2');

      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('IN_PROGRESS');

      // act
      expect(() => triviaGame.join('player3')).toThrow('Cannot join game: already started');
    });

    it('throws an error if trying to join a completed game', () => {
      // assemble
      triviaGame.join('player1');
      triviaGame.join('player2');
      triviaGame.leave('player2');

      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toBeUndefined();
      expect(triviaGame.state.status).toEqual('OVER');

      expect(() => triviaGame.join('player3')).toThrow('Cannot join game: already started');
    });

    it('throws an error if trying to join a game the player is already in', () => {
      triviaGame.join('player1');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');

      expect(() => triviaGame.join('player1')).toThrow('Cannot join game: player already in game');
    });
  });

  describe('leave', () => {
    it('should remove player 1 from a game waiting to start', () => {
      triviaGame.join('player1');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');

      triviaGame.leave('player1');
      expect(triviaGame.state.player1).toBeUndefined();
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');
    });

    it('should remove player 1 from a game in progress and set it to over', () => {
      triviaGame.join('player1');
      triviaGame.join('player2');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('IN_PROGRESS');

      triviaGame.leave('player1');
      expect(triviaGame.state.player1).toBeUndefined();
      expect(triviaGame.state.status).toEqual('OVER');
      expect(triviaGame.state.winners).toEqual(['player2']);
    });

    it('should remove player 2 from a game in progress and set it to over', () => {
      triviaGame.join('player1');
      triviaGame.join('player2');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('IN_PROGRESS');

      triviaGame.leave('player2');
      expect(triviaGame.state.player2).toBeUndefined();
      expect(triviaGame.state.status).toEqual('OVER');
      expect(triviaGame.state.winners).toEqual(['player1']);
    });

    it('throws an error if trying to join a game the player is not in', () => {
      expect(() => triviaGame.leave('player1')).toThrow(
        'Cannot leave game: player player1 is not in the game.',
      );
    });
  });

  describe('saveGameState', () => {
    const findOneAndUpdateSpy = jest.spyOn(GameModel, 'findOneAndUpdate');
    const startGameState: GameInstance<TriviaGameState> = {
      state: {
        status: 'WAITING_TO_START',
        currentQuestionIndex: 0,
        questions: [],
        player1Answers: [],
        player2Answers: [],
        player1Score: 0,
        player2Score: 0,
      },
      gameID: expect.any(String),
      players: [],
      gameType: 'Nim',
    };

    it('should call findOneAndUpdate with the correct model arguments', async () => {
      findOneAndUpdateSpy.mockResolvedValue(startGameState);

      await triviaGame.saveGameState();

      expect(findOneAndUpdateSpy).toHaveBeenLastCalledWith(
        { gameID: expect.any(String) },
        startGameState,
        { upsert: true },
      );
    });

    it('should throw a database error', () => {
      findOneAndUpdateSpy.mockRejectedValueOnce(new Error('database error'));

      expect(triviaGame.saveGameState()).rejects.toThrow('database error');
    });
  });
});
