import express, { Request, Response, Router } from 'express';
import {
  SignupRequest,
  LoginRequest,
  UserRequest,
  User,
  UserLogin,
  UserByUsernameRequest,
  FakeSOSocket,
  UpdateBiographyRequest,
  WinnableGameState,
} from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  getUsersList,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import CommunityModel from '../models/community.model';
import GameModel from '../models/games.model';
import { generateToken } from '../utils/jwt.util';
import authMiddleware from '../middleware/auth';

const userController = (socket: FakeSOSocket) => {
  const router: Router = express.Router();

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: SignupRequest, res: Response): Promise<void> => {
    const requestUser = req.body;

    const user: User = {
      ...requestUser,
      dateJoined: new Date(),
      biography: requestUser.biography ?? '',
    };

    try {
      const result = await saveUser(user);

      if ('error' in result) {
        throw new Error(result.error);
      }

      // Generate token for automatic login after signup
      const token = generateToken({ userId: result._id.toString(), username: result.username });

      socket.emit('userUpdate', {
        user: result,
        type: 'created',
      });
      res.status(200).json({ user: result, token });
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: LoginRequest, res: Response): Promise<void> => {
    try {
      const loginCredentials: UserLogin = {
        username: req.body.username,
        password: req.body.password,
      };

      const user = await loginUser(loginCredentials);

      if ('error' in user) {
        throw Error(user.error);
      }

      const token = generateToken({ userId: user._id.toString(), username: user.username });
      res.status(200).json({ user, token });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      res.status(500).json({ error: errorMessage });
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);

      if ('error' in user) {
        throw Error(user.error);
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).send(`Error when getting user by username: ${error}`);
    }
  };

  /**
   * Retrieves all users from the database.
   * @param res The response, either returning the users or an error.
   * @returns A promise resolving to void.
   */
  const getUsers = async (_: Request, res: Response): Promise<void> => {
    try {
      const users = await getUsersList();

      if ('error' in users) {
        throw Error(users.error);
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either confirming deletion or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const deletedUser = await deleteUserByUsername(username);

      if ('error' in deletedUser) {
        throw Error(deletedUser.error);
      }

      socket.emit('userUpdate', {
        user: deletedUser,
        type: 'deleted',
      });
      res.status(200).json(deletedUser);
    } catch (error) {
      res.status(500).send(`Error when deleting user by username: ${error}`);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      const updatedUser = await updateUser(req.body.username, { password: req.body.password });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user password: ${error}`);
    }
  };

  /**
   * Updates a user's biography.
   * @param req The request containing the username and biography in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateBiography = async (req: UpdateBiographyRequest, res: Response): Promise<void> => {
    try {
      // Validate that request has username and biography
      const { username, biography } = req.body;

      // Call the same updateUser(...) service used by resetPassword
      const updatedUser = await updateUser(username, { biography });

      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      // Emit socket event for real-time updates
      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when updating user biography: ${error}`);
    }
  };

  const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const username = req.user!.username;
      const user = await getUserByUsername(username);

      if ('error' in user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get current user' });
    }
  };

  const markWelcomeMessageSeen = async (req: Request, res: Response): Promise<void> => {
    try {
      const username = req.user!.username;
      const updatedUser = await updateUser(username, { hasSeenWelcomeMessage: true });

      if ('error' in updatedUser) {
        throw Error(updatedUser.error);
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error when marking welcome message as seen: ${error}`);
    }
  };

  /**
   * Gets statistics for a user.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the stats or an error.
   * @returns A promise resolving to void.
   */
  const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const questionsPosted = await QuestionModel.countDocuments({ askedBy: username });
      const answersPosted = await AnswerModel.countDocuments({ ansBy: username });
      const communitiesJoined = await CommunityModel.countDocuments({
        participants: username,
      });

      // Trivia Game
      const allGames = await GameModel.find({ players: username });
      const quizzesPlayed = allGames.length;
      const quizzesWon = allGames.filter(game => {
        const state = game.state as WinnableGameState;
        return state.winners && state.winners.includes(username);
      }).length;

      res.status(200).json({
        questionsPosted,
        answersPosted,
        communitiesJoined,
        quizzesWon,
        quizzesPlayed,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user stats' });
    }
  };

  /**
   * Toggles the visibility of a user's profile stats.
   * @param req The request containing the username, field, and value in the body.
   * @param res The response, either confirming the update or returning an error.
   * @returns A promise resolving to void.
   */
  const updateStatVisibility = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, field, value } = req.body;
      if (username !== req.user!.username) {
        res.status(401).send('Unauthorized');
        return;
      }
      if (field != 'showStats') {
        res.status(400).send('Invalid field');
        return;
      }
      const updatedUser = await updateUser(username, { [field]: value });
      if ('error' in updatedUser) {
        throw new Error(updatedUser.error);
      }

      socket.emit('userUpdate', {
        user: updatedUser,
        type: 'updated',
      });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).send(`Error updating visibility: ${(error as Error).message}`);
    }
  };

  // Define routes for the user-related operations.
  router.post('/signup', createUser);
  router.post('/login', userLogin);
  router.patch('/resetPassword', resetPassword);
  router.get('/getUser/:username', getUser);
  router.get('/getUsers', getUsers);
  router.delete('/deleteUser/:username', deleteUser);
  router.patch('/updateBiography', updateBiography);
  router.get('/me', authMiddleware, getCurrentUser);
  router.patch('/markWelcomeSeen', authMiddleware, markWelcomeMessageSeen);
  router.get('/stats/:username', getUserStats);
  router.patch('/updateStatVisibility', authMiddleware, updateStatVisibility);
  return router;
};

export default userController;
