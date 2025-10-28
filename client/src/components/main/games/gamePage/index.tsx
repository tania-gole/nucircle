import './index.css';
import NimGamePage from '../nimGamePage';
import TriviaGamePage from '../triviaGamePage';
import useGamePage from '../../../../hooks/useGamePage';
import { GameInstance, NimGameState, TriviaGameState } from '../../../../types/types';

/**
 * Component to display the game page for a specific game type, including controls and game state
 * @returns A React component including:
 * - A header with the game title and current game status
 * - A Leave Game button to exit the current game
 * - The game component specific to the game type (like `NimGamePage` for "Nim")
 * - An error message if an error occurs during the game
 */
const GamePage = () => {
  const { gameInstance, error, handleLeaveGame } = useGamePage();

  /**
   * Renders the appropriate game component based on the game type
   * @param gameType The type of the game to render (e.g., "Nim", "Trivia")
   * @returns A React component corresponding to the specified game type, or a message for unknown types
   */
  const renderGameComponent = (gameType: string) => {
    if (!gameInstance) return null;

    switch (gameType) {
      case 'Nim':
        return <NimGamePage gameInstance={gameInstance as GameInstance<NimGameState>} />;
      case 'Trivia':
        return <TriviaGamePage gameInstance={gameInstance as GameInstance<TriviaGameState>} />;
      default:
        return <div>Unknown game type</div>;
    }
  };

  const getGameTitle = () => {
    if (!gameInstance) return 'Game';
    return gameInstance.gameType === 'Nim' ? 'Nim Game' : gameInstance.gameType === 'Trivia' ? 'Trivia Quiz' : 'Game';
  };

  return (
    <div className='game-page'>
      <header className='game-header'>
        <h1>{getGameTitle()}</h1>
        <p className='game-status'>
          Status: {gameInstance ? gameInstance.state.status : 'Not started'}
        </p>
      </header>

      <div className='game-controls'>
        <button className='btn-leave-game' onClick={handleLeaveGame}>
          Leave Game
        </button>
      </div>

      {gameInstance && renderGameComponent(gameInstance.gameType)}

      {error && <div className='game-error'>{error}</div>}
    </div>
  );
};

export default GamePage;
