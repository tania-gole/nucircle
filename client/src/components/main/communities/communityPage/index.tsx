import { DatabaseCommunity } from '@fake-stack-overflow/shared';
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
  const { community, communityQuestions, user, handleDeleteCommunity } = useCommunityPage();

  if (!community) {
    return <div className='loading'>Loading...</div>;
  }

  const getLongestStreakUser = (community: DatabaseCommunity): React.ReactNode => {
    if (!community.visitStreaks || community.visitStreaks.length === 0) {
      return <span>No streaks yet</span>;
    }

    const topStreaker = community.visitStreaks.reduce((max, current) =>
      current.longestStreak > max.longestStreak ? current : max,
    );

    const days = topStreaker.longestStreak === 1 ? 'day' : 'days';

    return (
      <>
        <strong>{topStreaker.username}</strong> holds the record with{' '}
        <strong>{topStreaker.longestStreak}</strong> {days}
      </>
    );
  };

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
          {(() => {
            // If user leaves community and rejoins within the same day, their streak is maintained
            const streak = community.participants.includes(user.username)
              ? community.visitStreaks?.find(v => v.username === user.username)?.currentStreak || 0
              : 0;
            return `${streak} ${streak === 1 ? 'day' : 'days'}`;
          })()}{' '}
          in a row
        </p>
        <h4>Longest Streak</h4>
        <p>{getLongestStreakUser(community)}</p>
        <CommunityMembershipButton community={community} />

        <div className='community-members'>
          <h3 className='section-heading'>Members</h3>
          <ul className='members-list'>
            {community?.participants.map(username => (
              <li key={username} className='member-item'>
                {username}
              </li>
            ))}
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
