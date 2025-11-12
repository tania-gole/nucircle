import useCommunityPage from '../../../../hooks/useCommunityPage';
// import CommunityMessages from '../../communityMessagesPage';
import QuestionView from '../../questionPage/question';
import CommunityMembershipButton from '../communityMembershipButton';
import './index.css';

/**
 * This component displays the details of a specific community, including its name, description,
 * members, and questions.
 */
const CommunityPage = () => {
  const { community, communityQuestions, user, handleDeleteCommunity, membersOnlineStatus } =
    useCommunityPage();
  if (!community) {
    return <div className='loading'>Loading...</div>;
  }

  const onlineCount = community.participants.filter(
    username => membersOnlineStatus[username]?.isOnline === true,
  ).length;

  return (
    <div className='community-page-layout'>
      <main className='questions-section'>
        <h3 className='section-heading'>Questions</h3>
        {communityQuestions.map(q => (
          <QuestionView question={q} key={q._id.toString()} />
        ))}
        {/* <h3 className='section-heading'>Community Chat</h3> */}
        {/* <CommunityMessages /> */}
      </main>

      <div className='community-sidebar'>
        <h2 className='community-title'>{community.name}</h2>
        <p className='community-description'>{community.description}</p>
        <h4>Daily Streak</h4>
        <p>
          Community visited{' '}
          {community.visitStreaks?.find(v => v.username === user.username)?.currentStreak || 0} days
          in a row
        </p>
        <CommunityMembershipButton community={community} />

        <div className='community-members'>
          <h3 className='section-heading'>Members ({onlineCount} online)</h3>
          <ul className='members-list'>
            {community?.participants.map(username => {
              const memberStatus = membersOnlineStatus[username];
              return (
                <li key={username} className='member-item'>
                  {memberStatus?.isOnline && <span className='online-indicator'></span>}
                  {username}
                </li>
              );
            })}
          </ul>
        </div>
        {community.admin === user.username && (
          <button className='delete-community-btn' onClick={handleDeleteCommunity}>
            Delete Community
          </button>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
