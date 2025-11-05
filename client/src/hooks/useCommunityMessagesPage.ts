import { useEffect, useState } from 'react';
import { DatabaseCommunity, DatabaseMessage, MessageUpdatePayload, Message } from '../types/types';
import useUserContext from './useUserContext';
import { getUserCommunities } from '../services/communityService';
import { addCommunityMessage, getCommunityMessages } from '../services/communityMessagesService';

/**
 * Custom hook for the Community Messages Page.
 *
 * @returns communities - The list of communities the user is part of.
 * @returns selectedCommunity - The currently selected community.
 * @returns setSelectedCommunity - Function to change the selected community.
 */
const useCommunityMessagesPage = () => {
  const { user, socket } = useUserContext();
  const [communities, setCommunities] = useState<DatabaseCommunity[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<DatabaseCommunity | null>(null);
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // fetch communities the user is part of
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        if (!user) return;
        const userCommunities: DatabaseCommunity[] = await getUserCommunities(user.username);
        setCommunities(userCommunities);
        setSelectedCommunity(userCommunities[0] || null);
      } catch (err) {
        setError('Failed to fetch communities');
      }
    };
    fetchCommunities();
  }, [user]);

  // fetch messages when selected community changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedCommunity) return;
      try {
        const msgs: DatabaseMessage[] = await getCommunityMessages(
          selectedCommunity._id.toString(),
        );
        setMessages(msgs); // Replace with actual fetched messages
      } catch (err) {
        setError('Failed to fetch messages');
      }
    };
    fetchMessages();
  }, [selectedCommunity]);

  useEffect(() => {
    if (!socket) return;
    const handleMessageUpdate = async (data: MessageUpdatePayload) => {
      setMessages([...messages, data.msg]);
    };

    socket.on('messageUpdate', handleMessageUpdate);
    return () => {
      socket.off('messageUpdate', handleMessageUpdate);
    };
  }, [socket, selectedCommunity, messages]);

  // handle sending a new message
  const handleSendMessage = async () => {
    if (!selectedCommunity) {
      setError('No community selected');
      return;
    }
    if (newMessage === '') {
      setError('Message cannot be empty');
      return;
    }

    setError('');

    const msgToSend: Message = {
      msg: newMessage,
      msgFrom: user.username,
      msgDateTime: new Date(),
      type: 'community',
    };

    try {
      await addCommunityMessage(selectedCommunity._id.toString(), msgToSend);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  return {
    communities,
    selectedCommunity,
    setSelectedCommunity,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    error,
  };
};

export default useCommunityMessagesPage;
