import GameModel from '../../../models/games.model';
import GameManager from '../../../services/games/gameManager';
import TriviaGame from '../../../services/games/trivia';
import { GameType } from '../../../types/types';

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'testGameID'), // Mock the return value
}));

describe('GameManager', () => {
  afterEach(() => {
    GameManager.resetInstance(); // Call the reset method
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  describe('constructor', () => {
    it('should create a singleton instance of GameManager', () => {
      const gameManager = GameManager.getInstance();

      // Object references should be the same
      expect(GameManager.getInstance()).toBe(gameManager);
    });
  });

  describe('resetInstance', () => {
    it('should reset the singleton instance of GameManager', () => {
      const gameManager1 = GameManager.getInstance();

      GameManager.resetInstance();

      const gameManager2 = GameManager.getInstance();

      expect(gameManager1).not.toBe(gameManager2);
    });
  });

  describe('addGame', () => {
    const mapSetSpy = jest.spyOn(Map.prototype, 'set');

    it('should return the gameID for a successfully created game', async () => {
      jest
        .spyOn(GameModel, 'create')
        .mockResolvedValue(
          new TriviaGame('testUser').toModel() as unknown as ReturnType<typeof GameModel.create>,
        );

      const gameManager = GameManager.getInstance();
      const gameID = await gameManager.addGame('Trivia', 'testUser');

      expect(gameID).toEqual('testGameID');
      expect(mapSetSpy).toHaveBeenCalledWith(gameID, expect.any(TriviaGame));
    });

    it('should return an error for an invalid game type', async () => {
      const gameManager = GameManager.getInstance();
      // casting string for error testing purposes
      const error = await gameManager.addGame('fakeGame' as GameType, 'testUser');

      expect(mapSetSpy).not.toHaveBeenCalled();
      expect(error).toHaveProperty('error');
      expect(error).toEqual({ error: 'Invalid game type' });
    });

    it('should return an error for a database error', async () => {
      jest.spyOn(GameModel, 'create').mockRejectedValueOnce(() => new Error('database error'));

      const gameManager = GameManager.getInstance();
      // casting string for error testing purposes
      const error = await gameManager.addGame('Trivia', 'testUser');

      expect(mapSetSpy).not.toHaveBeenCalled();
      expect(error).toHaveProperty('error');
    });
  });

  describe('removeGame', () => {
    const mapDeleteSpy = jest.spyOn(Map.prototype, 'delete');

    it('should remove the game with the provided gameID', async () => {
      jest
        .spyOn(GameModel, 'create')
        .mockResolvedValue(
          new TriviaGame('testUser').toModel() as unknown as ReturnType<typeof GameModel.create>,
        );

      // assemble
      const gameManager = GameManager.getInstance();
      const gameID = await gameManager.addGame('Trivia', 'testUser');
      expect(gameManager.getActiveGameInstances().length).toEqual(1);

      if (typeof gameID === 'string') {
        // act
        const removed = gameManager.removeGame(gameID);

        // assess
        expect(removed).toBeTruthy();
        expect(gameManager.getActiveGameInstances().length).toEqual(0);
        expect(mapDeleteSpy).toHaveBeenCalledWith(gameID);
      }
    });

    it('should return false if there is no game with the provided gameID', async () => {
      // assemble
      const gameManager = GameManager.getInstance();
      const gameID = 'fakeGameID';

      // act
      const removed = gameManager.removeGame(gameID);

      // assess
      expect(removed).toBeFalsy();
      expect(mapDeleteSpy).toHaveBeenCalledWith(gameID);
    });
  });

  describe('getGame', () => {
    let gameManager: GameManager;
    const mapGetSpy = jest.spyOn(Map.prototype, 'get');

    beforeEach(() => {
      gameManager = GameManager.getInstance();
    });

    it('should return the game if it exists', async () => {
      // assemble
      jest
        .spyOn(GameModel, 'create')
        .mockResolvedValue(
          new TriviaGame('testUser').toModel() as unknown as ReturnType<typeof GameModel.create>,
        );

      const gameID = await gameManager.addGame('Trivia', 'testUser');

      if (typeof gameID === 'string') {
        // act
        const game = gameManager.getGame(gameID);

        expect(game).toBeInstanceOf(TriviaGame);
        expect(mapGetSpy).toHaveBeenCalledWith(gameID);
      }
    });

    it('should return undefined if the game request does not exist', () => {
      const gameID = 'fakeGameID';
      const game = gameManager.getGame(gameID);

      expect(game).toBeUndefined();
      expect(mapGetSpy).toHaveBeenCalledWith(gameID);
    });
  });

  describe('getActiveGameInstances', () => {
    it('should be empty on initialization', () => {
      const games = GameManager.getInstance().getActiveGameInstances();
      expect(games.length).toEqual(0);
    });

    it('should return active games', async () => {
      jest
        .spyOn(GameModel, 'create')
        .mockResolvedValue(
          new TriviaGame('testUser').toModel() as unknown as ReturnType<typeof GameModel.create>,
        );
      // assemble
      const gameManager = GameManager.getInstance();
      await gameManager.addGame('Trivia', 'testUser');

      // act
      const games = gameManager.getActiveGameInstances();
      expect(games.length).toEqual(1);
      expect(games[0]).toBeInstanceOf(TriviaGame);
    });
  });
});
