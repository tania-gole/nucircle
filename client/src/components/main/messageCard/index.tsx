import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import { DatabaseMessage } from '../../../types/types';
import { getMetaData } from '../../../tool';
import { toggleReaction } from '../../../services/messageService';

interface MessageCardProps {
  message: DatabaseMessage;
  currentUser: string;
}

/**
 * MessageCard component displays a single message with its sender and timestamp.
 *
 * @param message: The message object to display.
 */
const MessageCard = ({ message, currentUser }: MessageCardProps) => {
  const isMine = message.msgFrom === currentUser;

  const [reactions, setReactions] = useState(
    message.reactions || {
      love: { users: [], count: 0 },
      like: { users: [], count: 0 },
    },
  );

  const [error, setError] = useState<string | null>(null);

  const handleReaction = async (reactionType: 'love' | 'like') => {
    try {
      // Optimistic update
      setReactions(prev => {
        const hasReacted = prev[reactionType].users.includes(currentUser);
        const updatedUsers = hasReacted
          ? prev[reactionType].users.filter(u => u !== currentUser)
          : [...prev[reactionType].users, currentUser];

        return {
          ...prev,
          [reactionType]: {
            users: updatedUsers,
            count: hasReacted
              ? Math.max(prev[reactionType].count - 1, 0)
              : prev[reactionType].count + 1,
          },
        };
      });

      await toggleReaction(message._id.toString(), reactionType, currentUser);
    } catch (err) {
      setError('Failed to toggle reaction');
    }
  };

  return (
    <div className={`message ${isMine ? 'message-mine' : 'message-other'}`}>
      <div className='message-header'>
        <div className='message-sender'>{message.msgFrom}</div>
        <div className='message-time'>{getMetaData(new Date(message.msgDateTime))}</div>
      </div>

      <div className='message-body'>
        <Markdown remarkPlugins={[remarkGfm]}>{message.msg}</Markdown>
      </div>

      <div className='message-reactions'>
        <button
          className={`reaction-btn ${reactions.like.users.includes(currentUser) ? 'active' : ''}`}
          onClick={() => handleReaction('like')}>
          👍 {reactions.like.count > 0 && reactions.like.count}
        </button>
        <button
          className={`reaction-btn ${reactions.love.users.includes(currentUser) ? 'active' : ''}`}
          onClick={() => handleReaction('love')}>
          ❤️ {reactions.love.count > 0 && reactions.love.count}
        </button>
        {error && <p className='error-text'>{error}</p>}
      </div>
    </div>
  );
};

export default MessageCard;
