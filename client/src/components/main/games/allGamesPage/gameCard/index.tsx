import './index.css';
import { GameInstance, GameState } from '../../../../../types/types';

/**
 * Component to display a game card with details about a specific game instance.
 * @param game The game instance to display.
 * @param handleJoin Function to handle joining the game. Takes the game ID as an argument.
 * @param handleDelete Function to handle deleting the game. Takes the game ID as an argument.
 * @returns A React component rendering the game details and a join button if the game is waiting to start.
 */
const GameCard = ({
  game,
  handleJoin,
  handleDelete,
}: {
  game: GameInstance<GameState>;
  handleJoin: (gameID: string) => void;
  handleDelete: (gameID: string) => void;
}) => (
  <div className='game-item'>
    <p>
      <strong>Game ID:</strong> {game.gameID} | <strong>Status:</strong> {game.state.status}
    </p>
    <ul className='game-players'>
      {game.players.length > 0 ? (
        game.players.map((player: string) => (
          <li key={`${game.gameID}-${player}`}>{player}</li>
        ))
      ) : (
        <li>No players</li>
      )}
    </ul>
    <div className='game-actions'>
      {game.state.status === 'WAITING_TO_START' && (
        <button className='btn-join-game' onClick={() => handleJoin(game.gameID)}>
          Join Game
        </button>
      )}
      {(game.state.status === 'WAITING_TO_START' || game.state.status === 'OVER') && (
        <button className='btn-delete-game' onClick={() => handleDelete(game.gameID)}>
          Delete Game
        </button>
      )}
    </div>
  </div>
);

export default GameCard;
