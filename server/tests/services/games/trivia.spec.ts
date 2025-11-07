import GameModel from '../../../models/games.model';
import TriviaQuestionModel from '../../../models/triviaQuestion.model';
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
    it('should return a representation of the initial game state', () => {
      const actualModel = triviaGame.toModel();
      expect(actualModel.state.status).toEqual('WAITING_TO_START');
      expect(actualModel.state.currentQuestionIndex).toEqual(0);
      expect(actualModel.state.questions).toEqual([]);
      expect(actualModel.state.player1Answers).toEqual([]);
      expect(actualModel.state.player2Answers).toEqual([]);
      expect(actualModel.state.player1Score).toEqual(0);
      expect(actualModel.state.player2Score).toEqual(0);
      expect(actualModel.gameID).toEqual(triviaGame.id);
      expect(actualModel.players).toEqual([]);
      expect(actualModel.gameType).toEqual('Trivia');
      expect(actualModel.createdBy).toEqual('testUser');
    });

    it('should return a representation of the current game state', async () => {
      jest.spyOn(TriviaQuestionModel, 'aggregate').mockResolvedValue([]);

      await triviaGame.join('player1');

      const gameState1 = triviaGame.toModel();
      expect(gameState1.state.status).toEqual('WAITING_TO_START');
      expect(gameState1.state.player1).toEqual('player1');
      expect(gameState1.players).toEqual(['player1']);

      await triviaGame.join('player2');
      await triviaGame.startGame();

      const gameState2 = triviaGame.toModel();
      expect(gameState2.state.status).toEqual('IN_PROGRESS');
      expect(gameState2.state.player1).toEqual('player1');
      expect(gameState2.state.player2).toEqual('player2');
      expect(gameState2.players).toEqual(['player1', 'player2']);

      triviaGame.leave('player1');

      const gameState3 = triviaGame.toModel();
      expect(gameState3.state.status).toEqual('OVER');
      expect(gameState3.state.player1).toBeUndefined();
      expect(gameState3.state.player2).toEqual('player2');
      expect(gameState3.state.winners).toEqual(['player2']);
      expect(gameState3.players).toEqual(['player2']);
    });
  });

  describe('join', () => {
    it('adds player1 to the game', async () => {
      expect(triviaGame.state.player1).toBeUndefined();

      await triviaGame.join('player1');

      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');
    });

    it('adds player2 to the game and sets the game status to IN_PROGRESS', async () => {
      await triviaGame.join('player1');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');

      await triviaGame.join('player2');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');
    });

    it('throws an error if trying to join an in progress game', async () => {
      await triviaGame.join('player1');
      await triviaGame.join('player2');
      await triviaGame.startGame();

      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('IN_PROGRESS');

      await expect(triviaGame.join('player3')).rejects.toThrow('Cannot join game: already started');
    });

    it('throws an error if trying to join a completed game', async () => {
      jest.spyOn(TriviaQuestionModel, 'aggregate').mockResolvedValue([]);
      await triviaGame.join('player1');
      await triviaGame.join('player2');
      await triviaGame.startGame();
      triviaGame.leave('player2');

      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toBeUndefined();
      expect(triviaGame.state.status).toEqual('OVER');

      await expect(triviaGame.join('player3')).rejects.toThrow('Cannot join game: already started');
    });

    it('throws an error if trying to join a game the player is already in', async () => {
      await triviaGame.join('player1');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');

      await expect(triviaGame.join('player1')).rejects.toThrow('Cannot join game: player already in game');
    });
  });

  describe('leave', () => {
    it('should remove player 1 from a game waiting to start', async () => {
      await triviaGame.join('player1');
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');

      triviaGame.leave('player1');
      expect(triviaGame.state.player1).toBeUndefined();
      expect(triviaGame.state.status).toEqual('WAITING_TO_START');
    });

    it('should remove player 1 from a game in progress and set it to over', async () => {
      await triviaGame.join('player1');
      await triviaGame.join('player2');
      await triviaGame.startGame();
      expect(triviaGame.state.player1).toEqual('player1');
      expect(triviaGame.state.player2).toEqual('player2');
      expect(triviaGame.state.status).toEqual('IN_PROGRESS');

      triviaGame.leave('player1');
      expect(triviaGame.state.player1).toBeUndefined();
      expect(triviaGame.state.status).toEqual('OVER');
      expect(triviaGame.state.winners).toEqual(['player2']);
    });

    it('should remove player 2 from a game in progress and set it to over', async () => {
      await triviaGame.join('player1');
      await triviaGame.join('player2');
      await triviaGame.startGame();
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

    it('should call findOneAndUpdate with the correct model arguments', async () => {
      const expectedState = triviaGame.toModel();
      findOneAndUpdateSpy.mockResolvedValue(expectedState);

      await triviaGame.saveGameState();

      expect(findOneAndUpdateSpy).toHaveBeenLastCalledWith(
        { gameID: expect.any(String) },
        expectedState,
        { upsert: true },
      );
    });

    it('should throw a database error', () => {
      findOneAndUpdateSpy.mockRejectedValueOnce(new Error('database error'));

      expect(triviaGame.saveGameState()).rejects.toThrow('database error');
    });
  });
});
