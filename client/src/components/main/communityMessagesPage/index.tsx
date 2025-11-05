import './index.css';
import useCommunityMessagesPage from '../../../hooks/useCommunityMessagesPage';
import MessageCard from '../messageCard';

/**
 * Represents the CommunityMessagesPage component which displays the community chat room.
 * and provides functionality to send and receive messages.
 */
const CommunityMessages = () => {
  // return <div>Community Messages Page - Under Construction</div>;
  const {
    communities,
    selectedCommunity,
    setSelectedCommunity,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    error,
  } = useCommunityMessagesPage();
  return (
    <div className='community-messages-page'>
      <div className='community-selector'>
        {communities.map(community => (
          <button
            key={community._id.toString()}
            onClick={() => setSelectedCommunity(community)}
            className={
              selectedCommunity?._id === community._id ? 'community-btn active' : 'community-btn'
            }>
            {community.name}
          </button>
        ))}
      </div>

      <div className='messages-container'>
        {messages.map(message => (
          <MessageCard key={String(message._id)} message={message} />
        ))}
      </div>
      <div className='message-input'>
        <textarea
          className='message-textbox'
          placeholder='Type your message here'
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage}
        />
        <div className='message-actions'>
          <button type='button' className='send-button' onClick={handleSendMessage}>
            Send
          </button>
          {error && <span className='error-message'>{error}</span>}
        </div>
      </div>
    </div>
  );
};

export default CommunityMessages;
