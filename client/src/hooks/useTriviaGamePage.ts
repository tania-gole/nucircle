import { useState } from 'react';
import useUserContext from './useUserContext';
import { GameInstance, TriviaGameState, GameMove, TriviaAnswer } from '../types/types';

/**
 * TRIVIA FEATURE: Client - Trivia Game UI Logic
 * This hook manages the trivia game UI state, as it:
 * - Tracks which answer option the user selected
 * - Checks if the current player has already answered the current question
 * - When the user clicks "Submit Answer", it emits the 'makeMove' socket event with answer
 * - Server processes answer and emits gameUpdate, which updates gameInstance
 *
 * Custom hook to manage the state and logic for the Trivia game page that includes submitting answers and tracking player responses
 * @param gameInstance The current instance of the Trivia game
 * @returns An object containing:
 * - user: The current user
 * - selectedAnswer: The currently selected answer index
 * - handleAnswerSelect: A function to select an answer
 * - handleSubmitAnswer: A function to submit the selected answer
 * - hasAnswered: Boolean indicating if current player has answered the current question
 */
const useTriviaGamePage = (gameInstance: GameInstance<TriviaGameState>) => {
  const { user, socket } = useUserContext();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const isPlayer1 = user.username === gameInstance.state.player1;
  const playerAnswers = isPlayer1
    ? gameInstance.state.player1Answers
    : gameInstance.state.player2Answers;

  const hasAnswered = playerAnswers.length > gameInstance.state.currentQuestionIndex;

  const handleAnswerSelect = (answerIndex: number) => {
    if (!hasAnswered && gameInstance.state.status === 'IN_PROGRESS') {
      setSelectedAnswer(answerIndex);
    }
  };

  /**
   * TRIVIA FEATURE: Submitting Answer
   * When user clicks "Submit Answer", this creates a GameMove object with:
   * - playerID: current user's username
   * - gameID: current game ID
   * - move: { questionId, answerIndex }
   * Then emits the 'makeMove' socket event to server, which processes it via the playMove handler
   */
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || hasAnswered) return;

    const currentQuestion = gameInstance.state.questions[gameInstance.state.currentQuestionIndex];

    const triviaMove: GameMove<TriviaAnswer> = {
      playerID: user.username,
      gameID: gameInstance.gameID,
      move: {
        questionId: currentQuestion.questionId,
        answerIndex: selectedAnswer,
      },
    };

    socket.emit('makeMove', {
      gameID: gameInstance.gameID,
      move: triviaMove,
    });

    setSelectedAnswer(null);
  };

  return {
    user,
    selectedAnswer,
    handleAnswerSelect,
    handleSubmitAnswer,
    hasAnswered,
  };
};

export default useTriviaGamePage;
