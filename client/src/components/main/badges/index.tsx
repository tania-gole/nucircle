import { Badge } from '../../../types/types';
import './index.css';

interface BadgesProps {
  badges: Badge[];
}

/**
 * Badges component displays a user's earned badges in a grid format.
 * Shows badge name, type, and earned date.
 */
const Badges = ({ badges }: BadgesProps) => {
  if (!badges || badges.length === 0) {
    return (
      <div className='badges-container'>
        <p className='badges-empty'>No badges earned yet.</p>
      </div>
    );
  }

  const getBadgeTypeClass = (type: string): string => {
    switch (type) {
      case 'community':
        return 'badge-community';
      case 'milestone':
        return 'badge-milestone';
      case 'leaderboard':
        return 'badge-leaderboard';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className='badges-container'>
      <div className='badges-grid'>
        {badges.map((badge, index) => (
          <div key={index} className={`badge-card ${getBadgeTypeClass(badge.type)}`}>
            <div className='badge-icon'>
              {badge.type === 'community' && '🤝'}
              {badge.type === 'milestone' && '🏆'}
              {badge.type === 'leaderboard' && '🥇'}
            </div>
            <div className='badge-info'>
              <div className='badge-name'>{badge.name}</div>
              <div className='badge-type'>{badge.type}</div>
              <div className='badge-date'>
                Earned: {new Date(badge.earnedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Badges;
