/* eslint-disable no-console */
import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { SafeDatabaseUser, UserUpdatePayload } from '../types/types';
import { getUsers, getLeaderboard } from '../services/userService';

/**
 * Custom hook for managing the users list page state, filtering, and real-time updates.
 *
 * @returns titleText - The current title of the users list page
 * @returns ulist - The list of users to display
 * @returns setUserFilter - Function to set the filtering value of the user search.
 */
const useUsersListPage = () => {
  const { socket } = useUserContext();

  const [userFilter, setUserFilter] = useState<string>('');
  const [userList, setUserList] = useState<SafeDatabaseUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<SafeDatabaseUser[]>([]);

  useEffect(() => {
    /**
     * Function to fetch users based and update the user list
     */
    const fetchData = async () => {
      try {
        const [users, leaders] = await Promise.all([getUsers(), getLeaderboard(20)]);
        setUserList(users);
        setLeaderboard(leaders);
      } catch (error) {
        console.error('Error fetching users/leaderboard:', error);
      }
    };

    /**
     * Removes a user from the userList using a filter
     * @param prevUserList the list of users
     * @param user the user to remove
     * @returns a list without the given user
     */
    const removeUserFromList = (prevUserList: SafeDatabaseUser[], user: SafeDatabaseUser) =>
      prevUserList.filter(otherUser => user.username !== otherUser.username);

    /**
     * Adds a user to the userList, if not present. Otherwise updates the user.
     * @param prevUserList the list of users
     * @param user the user to add
     * @returns a list with the user added, or updated if present.
     */
    const addUserToList = (prevUserList: SafeDatabaseUser[], user: SafeDatabaseUser) => {
      const userExists = prevUserList.some(otherUser => otherUser.username === user.username);

      if (userExists) {
        // Update the existing user
        return prevUserList.map(otherUser =>
          otherUser.username === user.username ? user : otherUser,
        );
      }

      return [user, ...prevUserList];
    };

    /**
     * Function to handle user updates from the socket.
     *
     * @param user - the updated user object.
     */
    const handleModifiedUserUpdate = (userUpdate: UserUpdatePayload) => {
      setUserList(prevUserList => {
        switch (userUpdate.type) {
          case 'created':
          case 'updated':
            return addUserToList(prevUserList, userUpdate.user);
          case 'deleted':
            return removeUserFromList(prevUserList, userUpdate.user);
          default:
            throw new Error('Invalid user update type');
        }
      });

      // Update leaderboard when user updates
      setLeaderboard(prev => {
        const updated = prev.map(u =>
          u.username === userUpdate.user.username ? userUpdate.user : u,
        );
        return updated.sort((a, b) => (b.points || 0) - (a.points || 0));
      });
    };

    fetchData();

    socket.on('userUpdate', handleModifiedUserUpdate);

    socket.on(
      'userStatusUpdate',
      (statusUpdate: { username: string; isOnline: boolean; lastSeen?: Date }) => {
        setUserList(prevUserList =>
          prevUserList.map(user =>
            user.username === statusUpdate.username
              ? { ...user, isOnline: statusUpdate.isOnline, lastSeen: statusUpdate.lastSeen }
              : user,
          ),
        );
      },
    );

    return () => {
      socket.off('userUpdate', handleModifiedUserUpdate);
      socket.off('userStatusUpdate');
    };
  }, [socket]);

  /**
   * Function to handle challenge user button click.
   *
   * @param recipientUsername - the user object requesting the quiz
   */
  // const handleChallengeClick = (recipientUsername: string) => {
  //   if (!socket) {
  //     return;
  //   }
  //   socket.emit('sendQuizInvite', recipientUsername);
  // };
  const handleChallengeClick = (recipientUsername: string) => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    console.log('[DEBUG] Socket ID:', socket.id); // ← ADD THIS
    console.log('[DEBUG] Socket connected:', socket.connected); // ← ADD THIS
    console.log(`Sending quiz invite to ${recipientUsername}`);
    socket.emit('sendQuizInvite', recipientUsername);
  };

  const filteredUserlist = userList.filter(user => user.username.includes(userFilter));
  return {
    userList: filteredUserlist,
    setUserFilter,
    handleChallengeClick,
    leaderboard,
  };
};

export default useUsersListPage;
