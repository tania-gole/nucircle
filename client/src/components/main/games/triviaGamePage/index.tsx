import './index.css';
import { GameInstance, TriviaGameState } from '../../../../types/types';
import useTriviaGamePage from '../../../../hooks/useTriviaGamePage';

/**
 * Component to display the Trivia game page
 * @param gameInstance The current instance of the Trivia game that has player details, questions, and scores
 * @returns A React component that shows:
 * - Current game status and player information
 * - Current question with multiple choice options
 * - Score tracking for both players
 * - Announcement with winner when game is over
 */
const TriviaGamePage = ({ gameInstance }: { gameInstance: GameInstance<TriviaGameState> }) => {
  const { user, selectedAnswer, handleAnswerSelect, handleSubmitAnswer, hasAnswered } =
    useTriviaGamePage(gameInstance);

  const currentQuestion =
    gameInstance.state.currentQuestionIndex < gameInstance.state.questions.length
      ? gameInstance.state.questions[gameInstance.state.currentQuestionIndex]
      : null;

  const isPlayer1 = user.username === gameInstance.state.player1;
  const otherPlayerAnswered = isPlayer1
    ? gameInstance.state.player2Answers.length > gameInstance.state.currentQuestionIndex
    : gameInstance.state.player1Answers.length > gameInstance.state.currentQuestionIndex;

  return (
    <div className='trivia-game-container'>
      <div className='trivia-game-header'>
        <h2>Trivia Quiz Battle</h2>
        <div className='trivia-progress'>
          Question {Math.min(gameInstance.state.currentQuestionIndex + 1, 10)} of 10
        </div>
      </div>

      <div className='trivia-players-section'>
        <div className='trivia-player-card'>
          <h3>Player 1</h3>
          <p className='player-name'>{gameInstance.state.player1 || 'Waiting...'}</p>
          <p className='player-score'>Score: {gameInstance.state.player1Score}</p>
        </div>
        <div className='trivia-vs'>VS</div>
        <div className='trivia-player-card'>
          <h3>Player 2</h3>
          <p className='player-name'>{gameInstance.state.player2 || 'Waiting...'}</p>
          <p className='player-score'>Score: {gameInstance.state.player2Score}</p>
        </div>
      </div>

      {gameInstance.state.status === 'IN_PROGRESS' && currentQuestion && (
        <div className='trivia-question-section'>
          <div className='trivia-question'>
            <h3>{currentQuestion.question}</h3>
          </div>

          <div className='trivia-options'>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`trivia-option ${selectedAnswer === index ? 'selected' : ''} ${
                  hasAnswered ? 'disabled' : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={hasAnswered}>
                <span className='option-letter'>{String.fromCharCode(65 + index)}.</span>
                <span className='option-text'>{option}</span>
              </button>
            ))}
          </div>

          {hasAnswered ? (
            <div className='trivia-status'>
              <p className='waiting-message'>
                ✓ Answer submitted! {otherPlayerAnswered ? 'Moving to next question...' : 'Waiting for other player...'}
              </p>
            </div>
          ) : (
            <button
              className='trivia-submit-btn'
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}>
              Submit Answer
            </button>
          )}
        </div>
      )}

      {gameInstance.state.status === 'OVER' && (
        <div className='trivia-game-over'>
          <h2>Game Over!</h2>
          <div className='trivia-final-scores'>
            <p>
              <strong>{gameInstance.state.player1}:</strong> {gameInstance.state.player1Score}/10
            </p>
            <p>
              <strong>{gameInstance.state.player2}:</strong> {gameInstance.state.player2Score}/10
            </p>
          </div>
          {gameInstance.state.winners && gameInstance.state.winners.length > 0 ? (
            <div className='trivia-winner'>
              {gameInstance.state.winners.length === 1 ? (
                <p className='winner-announce'>
                  🎉 Winner: <strong>{gameInstance.state.winners[0]}</strong> 🎉
                </p>
              ) : (
                <p className='winner-announce'>🤝 It's a tie! 🤝</p>
              )}
            </div>
          ) : (
            <p>No winner determined</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TriviaGamePage;
