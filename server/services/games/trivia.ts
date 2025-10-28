import { GameMove, TriviaGameState, TriviaAnswer } from '../../types/types';
import Game from './game';
import TriviaQuestionModel from '../../models/triviaQuestion.model';

/**
 * Represents a game of Trivia, extending the generic Game class, so this class contains the specific game logic for playing a trivia quiz game
 */
class TriviaGame extends Game<TriviaGameState, TriviaAnswer> {
  private correctAnswers: number[] = [];

    // Constructor
  public constructor() {
    super(
      {
        status: 'WAITING_TO_START',
        currentQuestionIndex: 0,
        questions: [],
        player1Answers: [],
        player2Answers: [],
        player1Score: 0,
        player2Score: 0,
      },
      'Trivia',
    );
  }

  // Fetches 10 random questions from database
  private async _fetchRandomQuestions(): Promise<void> {
    try {
      // MongoDB aggregation
      const questions = await TriviaQuestionModel.aggregate([
        { $sample: { size: 10 } },
      ]);

      // Store correct answers separately for players
      this.correctAnswers = questions.map((q: { correctAnswer: number }) => q.correctAnswer);

      // Map to TriviaQuestion format 
      this.state = {
        ...this.state,
        questions: questions.map((q: { _id: { toString: () => string }; question: string; options: string[] }) => ({
          questionId: q._id.toString(),
          question: q.question,
          options: q.options,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to fetch trivia questions: ${(error as Error).message}`);
    }
  }

  /**
   * Validates the answer submission
   * @param gameMove The move to validate
   * @throws Error if the move is invalid
   */
  private _validateMove(gameMove: GameMove<TriviaAnswer>): void {
    const { playerID, move } = gameMove;

    // Ensure game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new Error('Invalid move: game is not in progress');
    }

    // Ensure player is in game
    if (playerID !== this.state.player1 && playerID !== this.state.player2) {
      throw new Error('Invalid move: player not in game');
    }

    // Ensure answer index is valid
    if (move.answerIndex < 0 || move.answerIndex > 3) {
      throw new Error('Invalid move: answer index must be between 0 and 3');
    }

    // Ensure the question ID matches current question
    const currentQuestion = this.state.questions[this.state.currentQuestionIndex];
    if (move.questionId !== currentQuestion.questionId) {
      throw new Error('Invalid move: question ID does not match current question');
    }

    // Check if player has already answered question
    const isPlayer1 = playerID === this.state.player1;
    const playerAnswers = isPlayer1 ? this.state.player1Answers : this.state.player2Answers;
    
    if (playerAnswers.length > this.state.currentQuestionIndex) {
      throw new Error('Invalid move: player has already answered this question');
    }
  }

  // Ensure both players have answered
  private _bothPlayersAnswered(): boolean {
    return (
      this.state.player1Answers.length > this.state.currentQuestionIndex &&
      this.state.player2Answers.length > this.state.currentQuestionIndex
    );
  }

  // Checks if game has ended and determines winner
  private _gameEndCheck(): void {
    if (this.state.currentQuestionIndex >= this.state.questions.length) {
      const player1Score = this.state.player1Score;
      const player2Score = this.state.player2Score;

      let winners: string[] = [];
      if (player1Score > player2Score && this.state.player1) {
        winners = [this.state.player1];
      } else if (player2Score > player1Score && this.state.player2) {
        winners = [this.state.player2];
      } else if (this.state.player1 && this.state.player2) {

        winners = [this.state.player1, this.state.player2];
      }

      this.state = {
        ...this.state,
        status: 'OVER',
        winners,
      };
    }
  }

  /**
   * Applies a move (answer submission) to the game
   * @param move The move to apply
   */
  public applyMove(move: GameMove<TriviaAnswer>): void {
    this._validateMove(move);

    const { playerID, move: answer } = move;
    const isPlayer1 = playerID === this.state.player1;
    const correctAnswer = this.correctAnswers[this.state.currentQuestionIndex];
    const isCorrect = answer.answerIndex === correctAnswer;

    if (isPlayer1) {
      this.state = {
        ...this.state,
        player1Answers: [...this.state.player1Answers, answer.answerIndex],
        player1Score: isCorrect ? this.state.player1Score + 1 : this.state.player1Score,
      };
    } else {
      this.state = {
        ...this.state,
        player2Answers: [...this.state.player2Answers, answer.answerIndex],
        player2Score: isCorrect ? this.state.player2Score + 1 : this.state.player2Score,
      };
    }

    if (this._bothPlayersAnswered()) {
      this.state = {
        ...this.state,
        currentQuestionIndex: this.state.currentQuestionIndex + 1,
      };
    }

    this._gameEndCheck();
  }

  /**
   * Joins a player to the game. The game can only be joined if it is waiting to start.
   * @param playerID The ID of the player joining the game.
   * @throws Will throw an error if the player cannot join.
   */
  protected async _join(playerID: string): Promise<void> {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new Error('Cannot join game: already started');
    }

    if (this._players.includes(playerID)) {
      throw new Error('Cannot join game: player already in game');
    }

    if (this.state.player1 === undefined) {
      this.state = { ...this.state, player1: playerID };
    } else if (this.state.player2 === undefined) {
      this.state = { ...this.state, player2: playerID };
    }

    if (this.state.player1 !== undefined && this.state.player2 !== undefined) {
      await this._fetchRandomQuestions();
      this.state = { ...this.state, status: 'IN_PROGRESS' };
    }
  }

  /**
   * Removes a player from the game. If a player leaves during an ongoing game, the game ends.
   * @param playerID The ID of the player leaving the game.
   * @throws Will throw an error if the player is not in the game.
   */
  protected _leave(playerID: string): void {
    if (!this._players.includes(playerID)) {
      throw new Error(`Cannot leave game: player ${playerID} is not in the game.`);
    }

    if (this.state.status === 'WAITING_TO_START' && this.state.player1 === playerID) {
      this.state = { ...this.state, player1: undefined };
    } else if (this.state.status === 'IN_PROGRESS') {
      if (this.state.player1 === playerID && this.state.player2 !== undefined) {
        this.state = {
          ...this.state,
          status: 'OVER',
          player1: undefined,
          winners: [this.state.player2],
        };
      } else if (this.state.player2 === playerID && this.state.player1 !== undefined) {
        this.state = {
          ...this.state,
          status: 'OVER',
          player2: undefined,
          winners: [this.state.player1],
        };
      }
    }
  }
}

export default TriviaGame;
