import UserModel from '../models/users.model';
import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import CommunityModel from '../models/community.model';
import { Badge, DatabaseUser } from '../types/types';

/**
 * Checks if a user already has a specific badge.
 *
 * @param username - The username of the user
 * @param badgeName - The name of the badge to check
 * @returns Promise resolving to true if user has the badge & false otherwise
 */
export const hasBadge = async (username: string, badgeName: string): Promise<boolean> => {
  try {
    const user = await UserModel.findOne({ username });
    if (!user || !user.badges) {
      return false;
    }
    return user.badges.some(badge => badge.name === badgeName);
  } catch (error) {
    return false;
  }
};

/**
 * Awards a badge to a user if they don't already have it.
 *
 * @param username - The username of the user
 * @param badge - The badge object to award
 * @returns Promise resolving to true if badge was awarded & false otherwise
 */
const awardBadge = async (username: string, badge: Badge): Promise<boolean> => {
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return false;
    }

    // Check if user already has this badge
    if (user.badges && user.badges.some(b => b.name === badge.name)) {
      return false;
    }

    // Add badge to user
    await UserModel.findOneAndUpdate({ username }, { $push: { badges: badge } }, { new: true });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Awards a community badge when a user joins a community.
 *
 * @param username - The username of the user
 * @param communityId - The ID of the community joined
 * @returns Promise resolving to true if badge was awarded, false otherwise
 */
export const checkAndAwardCommunityBadge = async (
  username: string,
  communityId: string,
): Promise<boolean> => {
  try {
    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return false;
    }

    const badgeName = `Community Member: ${community.name}`;
    const badge: Badge = {
      type: 'community',
      name: badgeName,
      earnedAt: new Date(),
    };

    return await awardBadge(username, badge);
  } catch (error) {
    return false;
  }
};

/**
 * Checks milestone thresholds and awards badges accordingly.
 * Milestones: 50 questions/answers, 100 questions/answers
 *
 * @param username - The username of the user
 * @param type - The type of milestone ('question' or 'answer')
 * @param count - The current count of questions or answers
 * @returns Promise resolving to true if any badge was awarded, false otherwise
 */
export const checkAndAwardMilestoneBadge = async (
  username: string,
  type: 'question' | 'answer',
  count: number,
): Promise<boolean> => {
  try {
    let badgeAwarded = false;

    // Check for 50 milestone
    if (count === 50) {
      const badgeName = `50 ${type === 'question' ? 'Questions' : 'Answers'}`;
      if (!(await hasBadge(username, badgeName))) {
        const badge: Badge = {
          type: 'milestone',
          name: badgeName,
          earnedAt: new Date(),
        };
        await awardBadge(username, badge);
        badgeAwarded = true;
      }
    }

    // Check for 100 milestone
    if (count === 100) {
      const badgeName = `100 ${type === 'question' ? 'Questions' : 'Answers'}`;
      if (!(await hasBadge(username, badgeName))) {
        const badge: Badge = {
          type: 'milestone',
          name: badgeName,
          earnedAt: new Date(),
        };
        await awardBadge(username, badge);
        badgeAwarded = true;
      }
    }

    return badgeAwarded;
  } catch (error) {
    return false;
  }
};

/**
 * Retrieves all badges for a user.
 *
 * @param username - The username of the user
 * @returns Promise resolving to array of badges or empty array
 */
export const getUserBadges = async (username: string): Promise<Badge[]> => {
  try {
    const user: DatabaseUser | null = await UserModel.findOne({ username });
    if (!user || !user.badges) {
      return [];
    }
    return user.badges;
  } catch (error) {
    return [];
  }
};

/**
 * Counts the number of questions asked by a user.
 *
 * @param username - The username of the user
 * @returns Promise resolving to the count of questions
 */
export const countUserQuestions = async (username: string): Promise<number> => {
  try {
    const count = await QuestionModel.countDocuments({ askedBy: username });
    return count;
  } catch (error) {
    return 0;
  }
};

/**
 * Counts the number of answers provided by a user.
 *
 * @param username - The username of the user
 * @returns Promise resolving to the count of answers
 */
export const countUserAnswers = async (username: string): Promise<number> => {
  try {
    const count = await AnswerModel.countDocuments({ ansBy: username });
    return count;
  } catch (error) {
    return 0;
  }
};
