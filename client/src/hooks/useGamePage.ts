import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import useUserContext from './useUserContext';
import { GameErrorPayload, GameInstance, GameState, GameUpdatePayload } from '../types/types';
import { joinGame, startGame, leaveGame } from '../services/gamesService';

interface GameWithPlayerState extends GameState {
  player1?: string;
  player2?: string;
}

/**
 * TRIVIA FEATURE: Client - Game Page State Management
 * This hook manages the game page lifecycle, as it:
 * - Joins the game when the page loads, via the URL param gameID
 * - Sets up socket listeners for real-time game updates
 * - Handles "Start Game" button click
 * - Handles "Leave Game" button click
 * - Updates the gameInstance state when socket events arrive
 *
 * Custom hook to manage the state and logic for the game page, including joining, leaving the game, and handling game updates.
 * @returns An object containing the following:
 * - `gameInstance`: The current game instance, or null if no game is joined.
 * - `error`: A string containing any error messages related to the game, or null if no errors exist.
 * - `handleLeaveGame`: A function to leave the current game and navigate back to the game list.
 */
const useGamePage = () => {
  const { user, socket } = useUserContext();
  const { gameID } = useParams();
  const navigate = useNavigate();

  const [gameInstance, setGameInstance] = useState<GameInstance<GameState> | null>(null);
  const [joinedGameID, setJoinedGameID] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closures and prevent effect re-runs
  const joinedGameIDRef = useRef(joinedGameID);
  const gameInstanceRef = useRef(gameInstance);
  joinedGameIDRef.current = joinedGameID;
  gameInstanceRef.current = gameInstance;

  const handleStartGame = async () => {
    if (!joinedGameIDRef.current) return;
    try {
      const updatedGame = await startGame(joinedGameIDRef.current);
      setGameInstance(updatedGame);
      setError(null);
    } catch (startError) {
      const errorMessage = startError instanceof Error ? startError.message : 'Error starting game';
      setError(errorMessage);
    }
  };

  const handleLeaveGame = async () => {
    if (joinedGameIDRef.current && gameInstanceRef.current?.state.status !== 'OVER') {
      try {
        await leaveGame(joinedGameIDRef.current, user.username);
      } catch {
        // silent leave error
      }
      setGameInstance(null);
      setJoinedGameID('');
    }

    socket.emit('leaveGame', joinedGameIDRef.current);
    navigate('/games');
  };

  // Effect for joining the game — runs only when gameID changes
  useEffect(() => {
    const handleJoinGame = async (id: string) => {
      // Check if already joined this game
      if (joinedGameIDRef.current === id && gameInstanceRef.current) {
        const state = gameInstanceRef.current.state as GameWithPlayerState;
        if (state?.player1 === user.username || state?.player2 === user.username) {
          return; // Already in this game
        }
      }

      try {
        // Join the socket room first to ensure receive updates
        socket.emit('joinGame', id);
        const joinedGame = await joinGame(id, user.username);
        setGameInstance(joinedGame);
        setJoinedGameID(joinedGame.gameID);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error joining game';
        // Don't show error if user is already in game
        if (!errorMessage.includes('already in game')) {
          setError(errorMessage);
        }
      }
    };

    if (gameID) {
      handleJoinGame(gameID);
    }
  }, [gameID, socket, user.username]);

  // Effect for socket listeners — stable deps, no re-subscription on game updates
  useEffect(() => {
    /**
     * TRIVIA FEATURE: Real-time Updates via Socket.IO
     * When the server emits 'gameUpdate' (after join, start, or answer submission), this handler updates the gameInstance state, causing the UI to re-render.
     */
    const handleGameUpdate = (updatedState: GameUpdatePayload) => {
      setGameInstance(updatedState.gameInstance);
      setError(null);
    };

    const handleGameError = (gameError: GameErrorPayload) => {
      if (gameError.player === user.username) {
        const errorLower = gameError.error.toLowerCase();
        if (!errorLower.includes('request failed with status code')) {
          setError(gameError.error);
        }
      }
    };

    const handleOpponentDisconnect = (payload: {
      gameId: string;
      disconnectedPlayer: string;
      winner: string;
      message: string;
    }) => {
      alert(`${payload.disconnectedPlayer} disconnected!`);
      navigate('/games');
    };

    socket.on('gameUpdate', handleGameUpdate);
    socket.on('gameError', handleGameError);
    socket.on('opponentDisconnected', handleOpponentDisconnect);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('gameError', handleGameError);
      socket.off('opponentDisconnected', handleOpponentDisconnect);
    };
  }, [socket, user.username, navigate]);

  return {
    gameInstance,
    error,
    handleStartGame,
    handleLeaveGame,
  };
};

export default useGamePage;
