import './index.css';
import { useNavigate } from 'react-router-dom';
import UserCardView from './userCard';
import UsersListHeader from './header';
import useUsersListPage from '../../../hooks/useUsersListPage';
import { SafeDatabaseUser } from '../../../types/types';
import useUserContext from '../../../hooks/useUserContext';

/**
 * Interface representing the props for the UsersListPage component.
 * handleUserSelect - The function to handle the click event on the user card.
 */
interface UserListPageProps {
  handleUserSelect?: (user: SafeDatabaseUser) => void;
}

/**
 * UsersListPage component renders a page displaying a list of users
 * based on search content filtering.
 * It includes a header with a search bar.
 */
const UsersListPage = (props: UserListPageProps) => {
  const { userList, leaderboard, setUserFilter, handleChallengeClick } = useUsersListPage();
  const { handleUserSelect = null } = props;
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();

  /**
   * Handles the click event on the user card.
   * If handleUserSelect is provided, it calls the handleUserSelect function.
   * Otherwise, it navigates to the user's profile page.
   */
  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    if (handleUserSelect) {
      handleUserSelect(user);
    } else if (user.username) {
      navigate(`/user/${user.username}`);
    }
  };

  return (
    <div className='user-card-container'>
      <UsersListHeader userCount={userList.length} setUserFilter={setUserFilter} />

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left column: All users */}
        <div style={{ flex: 1 }}>
          <h3>All Users</h3>
          <div id='users_list' className='users_list'>
            {userList.map((user, idx) => (
              <UserCardView
                key={idx}
                user={user}
                handleUserCardViewClickHandler={handleUserCardViewClickHandler}
                onChallengeClick={handleChallengeClick}
                currentUsername={currentUser?.username || ''}
              />
            ))}
          </div>
          {(!userList.length || userList.length === 0) && (
            <div className='bold_title right_padding'>No Users Found</div>
          )}
        </div>

        {/* Right column: Global leaderboard */}
        <div style={{ width: '300px' }}>
          <h3>🏆 Leaderboard</h3>
          <div className='users_list'>
            {leaderboard.map((user, index) => (
              <div
                key={user._id.toString()}
                className='userCard'
                onClick={() => navigate(`/user/${user.username}`)}
                style={{ cursor: 'pointer', padding: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <div>
                    <span style={{ fontSize: '1.2em', marginRight: '8px' }}>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `# ${index + 1}`}
                    </span>
                    <strong>{user.username}</strong>
                  </div>
                  <div style={{ color: '#82c0ff', fontWeight: 'bold' }}>{user.points || 0} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;
