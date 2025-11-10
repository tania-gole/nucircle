import './index.css';
import useAllCommunitiesPage from '../../../../hooks/useAllCommunitiesPage';
import CommunityCard from '../communityCard';
import NewCommunityButton from '../newCommunityButton';

/**
 * AllCommunitiesPage component displays a list of communities and allows users to search for and join them.
 */
const AllCommunitiesPage = () => {
  const { communities, search, handleInputChange, error, setError } = useAllCommunitiesPage();

  return (
    <div className='community-page'>
      <h2 className='community-title'>Communities</h2>
      <div className='community-controls'>
        <input
          className='community-search'
          placeholder='Search communities ...'
          type='text'
          value={search}
          onChange={handleInputChange}
        />
        <NewCommunityButton />
      </div>
      {error && <p className='community-error'>{error}</p>}
      <div className='communities-list'>
        {communities && communities.length > 0 ? (
          communities
            .filter(
              community =>
                community && community.name && community.name.toLowerCase().includes(search),
            )
            .map(community => (
              <CommunityCard
                key={community._id?.toString() || Math.random()}
                community={community}
                setError={setError}
              />
            ))
        ) : (
          <p className='community-empty'>No communities found.</p>
        )}
      </div>
    </div>
  );
};

export default AllCommunitiesPage;
