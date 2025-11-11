import './index.css';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
  onChallengeClick: (username: string) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Displays a green dot indicator if the user is currently online.
 * Clicking on the component triggers the handleUserPage function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler, onChallengeClick } = props;

  return (
    <div className='user_card' onClick={() => handleUserCardViewClickHandler(user)}>
      <div className='user_card_left'>
        <div className='user_card_name'>
          {user.firstName} {user.lastName}
        </div>
        <div className='userUsername'>
          {user.isOnline && <span className='online-indicator'></span>}
          {user.username}
        </div>
      </div>

      <div className='user_card_right'>
        <div className='user_card_joined'>joined {new Date(user.dateJoined).toUTCString()}</div>
        {user.isOnline && (
          <button
            className='challenge-button'
            onClick={e => {
              e.stopPropagation();
              onChallengeClick(user.username);
            }}>
            Challenge to Quiz
          </button>
        )}
        <svg
          width='20'
          height='32'
          viewBox='0 0 20 32'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M12.2667 16L6.60261e-05 3.73333L3.7334 0L19.7334 16L3.7334 32L6.60261e-05 28.2667L12.2667 16Z'
            fill='#FF6B6B'
          />
        </svg>
      </div>
    </div>
  );
};

export default UserCardView;
