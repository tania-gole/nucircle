import NimGame from '../../../services/games/nim';
import { MAX_NIM_OBJECTS } from '../../../types/constants';

describe('NimGame tests', () => {
  let nimGame: NimGame;

  beforeEach(() => {
    nimGame = new NimGame('testUser');
  });

  describe('constructor', () => {
    it('creates a blank game', () => {
      expect(nimGame.id).toBeDefined();
      expect(nimGame.id).toEqual(expect.any(String));
      expect(nimGame.state.status).toBe('WAITING_TO_START');
      expect(nimGame.state.moves).toEqual([]);
      expect(nimGame.state.player1).toBeUndefined();
      expect(nimGame.state.player2).toBeUndefined();
      expect(nimGame.state.winners).toBeUndefined();
      expect(nimGame.state.remainingObjects).toEqual(MAX_NIM_OBJECTS);
      expect(nimGame.gameType).toEqual('Nim');
    });
  });
});
