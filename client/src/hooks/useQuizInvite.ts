import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizInvite } from '../types/types';
import useUserContext from './useUserContext';

/**
 * Custom hook to manage quiz invitation state and socket events.
 * It listens for incoming invitations and handles responses.
 */
const useQuizInvite = () => {
  const [pendingInvitation, setPendingInvite] = useState<QuizInvite | null>(null);
  const navigate = useNavigate();
  const socket = useUserContext();

  useEffect(() => {
    if (!socket) return;

    // Function for handling quiz invitations when incoming
    const handleRecievedInvite = (invite: QuizInvite) => {
      setPendingInvite(invite);
    };

    // Function for handling when invitation is accepted
    const handleAcceptedInvite = (result: {
      inviteId: string;
      challengerUsername: string;
      recipientUsername: string;
      accepted: boolean;
      gameId?: string;
    }) => {
      setPendingInvite(null);
      if (result.gameId) {
        // Navigate to the game page
        navigate(`/games/${result.gameId}`);
      }
    };

    // Function for handling when invitation is declined
    const handleDeclinedInvite = (result: {
      inviteId: string;
      challengerUsername: string;
      recipientUsername: string;
      accepted: boolean;
    }) => {
      setPendingInvite(null);
    };

    // Register socket listeners
    socket.on('quizInviteReceived', handleRecievedInvite);
    socket.on('quizInviteAccepted', handleAcceptedInvite);
    socket.on('quizInviteDeclined', handleDeclinedInvite);

    return () => {
      socket.off('quizInviteReceived', handleRecievedInvite);
      socket.off('quizInviteAccepted', handleAcceptedInvite);
      socket.off('quizInviteDeclined', handleDeclinedInvite);
    };
  }, [socket, navigate]);

  // Handle the pending invitation
  const handlePendingAccept = () => {
    if (!socket || !pendingInvitation) return;

    // Modal will close when we received 'quizInviteAccepted' event
    socket.emit('respondToQuizInvite', pendingInvitation.id, true);
  };

  /**
   * Decline the pending invitation
   * Emits response to server and closes modal
   */
  const handlePendingDecline = () => {
    if (!socket || !pendingInvitation) return;

    // Modal will close when received 'quizInviteAccepted' event
    socket.emit('respondToQuizInvite', pendingInvitation.id, false);
    setPendingInvite(null);
  };

  return {
    pendingInvitation,
    handlePendingAccept,
    handlePendingDecline,
  };
};

export default useQuizInvite;
