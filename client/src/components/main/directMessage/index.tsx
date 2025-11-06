import './index.css';
import useDirectMessage from '../../../hooks/useDirectMessage';
import ChatsListCard from './chatsListCard';
import UsersListPage from '../usersListPage';
import MessageCard from '../messageCard';
import useUserContext from '../../../hooks/useUserContext';
/**
 * DirectMessage component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const DirectMessage = () => {
  const {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
  } = useDirectMessage();

  const { user } = useUserContext();

  return (
    <>
      {/* <div className='create-panel'>
        <button
          className='custom-button'
          onClick={() => setShowCreatePanel(prevState => !prevState)}>
          {showCreatePanel ? 'Hide Create Chat Panel' : 'Start a Chat'}
        </button>
        
        {showCreatePanel && (
          <>
            <p>Selected user: {chatToCreate}</p>
            <button className='custom-button' onClick={handleCreateChat}>
              Create New Chat
            </button>
            <UsersListPage handleUserSelect={handleUserSelect} />
          </>
        )}
      </div> */}

      <div className='direct-message-container'>
        {error && <div className='direct-message-error'>{error}</div>}
        <div className='chats-column'>
          {!showCreatePanel ? (
            <div className='chats-list'>
              {chats.map(chat => (
                <ChatsListCard
                  key={String(chat._id)}
                  chat={chat}
                  handleChatSelect={handleChatSelect}
                  participant={chat.participants.filter(p => p !== user.username).join(', ')}
                  isActive={selectedChat?._id === chat._id}
                />
              ))}
              <div className='create-chat-icon' onClick={() => setShowCreatePanel(true)}>
                <svg
                  width='50'
                  height='50'
                  viewBox='0 0 69 69'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'>
                  <rect x='7' y='7' width='56' height='56' rx='28' fill='#FF6B6B' />
                  <path
                    d='M34.5 23V46M23 34.5H46M63.25 34.5C63.25 50.3782 50.3782 63.25 34.5 63.25C18.6218 63.25 5.75 50.3782 5.75 34.5C5.75 18.6218 18.6218 5.75 34.5 5.75C50.3782 5.75 63.25 18.6218 63.25 34.5Z'
                    stroke='white'
                    stroke-width='4'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className='users-list-panel'>
              <button className='close-button' onClick={() => setShowCreatePanel(false)}>
                X
              </button>
              <p>Selected user: {chatToCreate}</p>
              <UsersListPage handleUserSelect={handleUserSelect} />
              <button className='custom-button' onClick={handleCreateChat}>
                Create New Chat
              </button>
            </div>
          )}
        </div>

        <div className='chat-container'>
          {selectedChat ? (
            <>
              <h2>
                Chat with: {selectedChat.participants.filter(p => p !== user.username).join(', ')}
              </h2>
              <div className='chat-messages'>
                {selectedChat.messages.map(message => (
                  <MessageCard
                    key={String(message._id)}
                    message={message}
                    currentUser={user.username}
                  />
                ))}
              </div>
              <div className='message-input'>
                <input
                  className='custom-input'
                  type='text'
                  value={newMessage}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Type a message...'
                />
                <button className='custom-button' onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <h2>Select a user to start chatting</h2>
          )}
        </div>
      </div>
    </>
  );
};

export default DirectMessage;
