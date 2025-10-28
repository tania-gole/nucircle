import { useState } from 'react';
import useUserContext from './useUserContext';
import { GameInstance, TriviaGameState, GameMove, TriviaAnswer } from '../types/types';

/**
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
