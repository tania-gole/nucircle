import NimModel from '../../models/nim.model';
import GameModel from '../../models/games.model';
import {
  BaseMove,
  GameInstance,
  GameInstanceID,
  GameMove,
  GameState,
  GameType,
} from '../../types/types';
import Game from './game';
import NimGame from './nim';
import TriviaGame from './trivia';

/**
 * Manages the lifecycle of games, including creation, joining, and leaving games.
 *
 * This class is responsible for handling game instances and ensuring that the right game logic is
 * applied based on the game type. It provides methods for adding, removing, joining, and leaving
 * games, and it maintains a map of active game instances.
 */
class GameManager {
  private static _instance: GameManager | undefined;
  private _games: Map<string, Game<GameState, GameMove<unknown>>>;

  /**
   * Private constructor to initialize the games map.
   */
  private constructor() {
    this._games = new Map();
  }

  /**
   * Factory method to create a new game based on the provided game type.
   * @param gameType The type of the game to create.
   * @returns A promise resolving to the created game instance.
   * @throws an error for an unsupported game type
   */
  private async _gameFactory(gameType: GameType): Promise<Game<GameState, BaseMove>> {
    switch (gameType) {
      case 'Nim': {
        const newGame = new NimGame();
        try {
          await NimModel.create(newGame.toModel());
        } catch (error) {
          console.error('Error creating Nim game in database:', error);
          throw error;
        }
        return newGame;
      }
      case 'Trivia': {
        const newGame = new TriviaGame();
        try {
          await GameModel.create(newGame.toModel());
        } catch (error) {
          console.error('Error creating Trivia game in database:', error);
          throw error;
        }
        return newGame;
      }
      default: {
        throw new Error('Invalid game type');
      }
    }
  }

  /**
   * Singleton pattern to get the unique instance of the GameManager.
   * @returns The instance of GameManager.
   */
  public static getInstance(): GameManager {
    if (!GameManager._instance) {
      GameManager._instance = new GameManager();
    }

    return GameManager._instance;
  }

  /**
   * TRIVIA FEATURE: GameManager - Game Creation
   * Central manager that creates game instances and stores them in memory.
   * Also saves to MongoDB database for persistence across server restarts.
   * 
   * Creates and adds a new game to the manager games map.
   * @param gameType The type of the game to add.
   * @returns The game ID or an error message.
   */
  public async addGame(gameType: GameType): Promise<GameInstanceID | { error: string }> {
    try {
      const newGame = await this._gameFactory(gameType);
      this._games.set(newGame.id, newGame);

      return newGame.id;
    } catch (error) {
      console.error('Error in addGame:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { error: errorMessage };
    }
  }

  /**
   * Removes a game from the manager by its ID.
   * @param gameID The ID of the game to remove.
   * @returns Whether the game was successfully removed.
   */
  public removeGame(gameID: string): boolean {
    return this._games.delete(gameID);
  }

  /**
   * Loads a game from the database and restores it to a Game instance.
   * @param gameID The ID of the game to load.
   * @returns The restored game instance or undefined if not found.
   */
  private async _loadGameFromDatabase(gameID: GameInstanceID): Promise<Game<GameState, BaseMove> | undefined> {
    try {
      const gameData = await GameModel.findOne({ gameID }).lean();

      if (!gameData) {
        console.log(`Game ${gameID} not found in database`);
        return undefined;
      }

      console.log(`Loading game ${gameID} from database, type: ${gameData.gameType}, status: ${gameData.state?.status}`);

      // Recreate the game instance based on game type
      let game: Game<GameState, BaseMove>;
      if (gameData.gameType === 'Nim') {
        const nimGame = new NimGame();
        // Override the ID and restore state
        Object.defineProperty(nimGame, 'id', { value: gameID, writable: false });
        (nimGame as any)._state = gameData.state;
        (nimGame as any)._players = gameData.players || [];
        game = nimGame;
      } else if (gameData.gameType === 'Trivia') {
        const triviaGame = new TriviaGame();
        // Override the ID and restore state
        Object.defineProperty(triviaGame, 'id', { value: gameID, writable: false });
        (triviaGame as any)._state = gameData.state;
        (triviaGame as any)._players = gameData.players || [];
        game = triviaGame;
      } else {
        console.error(`Unknown game type: ${gameData.gameType}`);
        return undefined;
      }

      // Add to in-memory map
      this._games.set(gameID, game);

      console.log(`Game ${gameID} loaded successfully, status: ${game.state.status}`);
      return game;
    } catch (error) {
      console.error('Error loading game from database:', error);
      return undefined;
    }
  }

  /**
   * Joins an existing game.
   * @param gameID The ID of the game to join.
   * @param playerID The ID of the player joining the game.
   * @returns The game instance or an error message.
   */
  public async joinGame(
    gameID: GameInstanceID,
    playerID: string,
  ): Promise<GameInstance<GameState> | { error: string }> {
    try {
      let gameToJoin = this.getGame(gameID);

      // If game not in memory, try loading from database
      if (gameToJoin === undefined) {
        gameToJoin = await this._loadGameFromDatabase(gameID);
      }

      if (gameToJoin === undefined) {
        throw new Error('Game requested does not exist.');
      }

      const stateBefore = gameToJoin.state as any;
      console.log(`Before join - Status: ${gameToJoin.state.status}, Players: ${stateBefore.player1 || 'none'}, ${stateBefore.player2 || 'none'}`);
      
      await gameToJoin.join(playerID);
      
      const stateAfter = gameToJoin.state as any;
      console.log(`After join - Status: ${gameToJoin.state.status}, Players: ${stateAfter.player1 || 'none'}, ${stateAfter.player2 || 'none'}`);
      console.log(`_players array: ${JSON.stringify((gameToJoin as any)._players)}`);
      
      await gameToJoin.saveGameState();
      
      const model = gameToJoin.toModel();
      console.log(`Returning model - Status: ${model.state.status}, Players array: ${JSON.stringify(model.players)}`);
      
      return model;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * TRIVIA FEATURE: GameManager - Starting Game
   * Calls the game-specific startGame() method which:
   * - For Trivia: fetches 10 random questions from the database
   * - Changes the status from WAITING_TO_START to IN_PROGRESS
   * 
   * Starts a game.
   * @param gameID The ID of the game to start.
   * @returns The updated game instance or an error message.
   */
  public async startGame(
    gameID: GameInstanceID,
  ): Promise<GameInstance<GameState> | { error: string }> {
    try {
      let gameToStart = this.getGame(gameID);

      // If game not in memory, try loading from database
      if (gameToStart === undefined) {
        gameToStart = await this._loadGameFromDatabase(gameID);
      }

      if (gameToStart === undefined) {
        throw new Error('Game requested does not exist.');
      }

      // Type guard to check if the game has a startGame method
      if ('startGame' in gameToStart && typeof (gameToStart as any).startGame === 'function') {
        const startResult = (gameToStart as any).startGame();
        // Handle both sync and async startGame methods
        if (startResult instanceof Promise) {
          await startResult;
        }
      } else {
        throw new Error('Game type does not support starting');
      }

      await gameToStart.saveGameState();

      return gameToStart.toModel();
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Allows a player to leave a game.
   * @param gameID The ID of the game to leave.
   * @param playerID The ID of the player leaving the game.
   * @returns The updated game state or an error message.
   */
  public async leaveGame(
    gameID: GameInstanceID,
    playerID: string,
  ): Promise<GameInstance<GameState> | { error: string }> {
    try {
      let gameToLeave = this.getGame(gameID);

      // If game not in memory, try loading from database
      if (gameToLeave === undefined) {
        gameToLeave = await this._loadGameFromDatabase(gameID);
      }

      if (gameToLeave === undefined) {
        throw new Error('Game requested does not exist.');
      }

      gameToLeave.leave(playerID);
      await gameToLeave.saveGameState();

      const leftGameState = gameToLeave.toModel();

      if (gameToLeave.state.status === 'OVER') {
        this.removeGame(gameID);
      }

      return leftGameState;
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  /**
   * Gets a game instance by its ID.
   * @param gameID The ID of the game.
   * @returns The game instance or undefined if not found.
   */
  public getGame(gameID: GameInstanceID): Game<GameState, BaseMove> | undefined {
    return this._games.get(gameID);
  }

  /**
   * Retrieves all active game instances.
   * @returns An array of all active game instances.
   */
  public getActiveGameInstances(): Game<GameState, BaseMove>[] {
    return Array.from(this._games.values());
  }

  /**
   * Resets the GameManager instance, clearing all active games.
   */
  public static resetInstance(): void {
    GameManager._instance = undefined;
  }
}

export default GameManager;
