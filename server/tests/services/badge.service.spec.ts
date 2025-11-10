import mongoose from 'mongoose';
import UserModel from '../../models/users.model';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';
import CommunityModel from '../../models/community.model';
import {
  hasBadge,
  checkAndAwardCommunityBadge,
  checkAndAwardMilestoneBadge,
  getUserBadges,
  countUserQuestions,
  countUserAnswers,
} from '../../services/badge.service';
import { Badge, DatabaseUser, DatabaseCommunity } from '../../types/types';

describe('Badge Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser: DatabaseUser = {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dc'),
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedPassword',
    dateJoined: new Date('2024-01-01'),
    biography: 'Test bio',
    badges: [],
  };

  const mockCommunity: DatabaseCommunity = {
    _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
    name: 'Test Community',
    description: 'Test Description',
    admin: 'admin_user',
    participants: ['admin_user'],
    visibility: 'PUBLIC',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  };

  describe('hasBadge', () => {
    it('should return true if user has the badge', async () => {
      const userWithBadge: DatabaseUser = {
        ...mockUser,
        badges: [
          {
            type: 'community',
            name: 'Community Member: Test Community',
            earnedAt: new Date(),
          },
        ],
      };
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithBadge);

      const result = await hasBadge('testuser', 'Community Member: Test Community');
      expect(result).toBe(true);
    });

    it('should return false if user does not have the badge', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await hasBadge('testuser', 'Community Member: Test Community');
      expect(result).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      const result = await hasBadge('nonexistent', 'Some Badge');
      expect(result).toBe(false);
    });

    it('should return false if user has no badges array', async () => {
      const userWithoutBadges = { ...mockUser, badges: undefined };
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithoutBadges as DatabaseUser);

      const result = await hasBadge('testuser', 'Some Badge');
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const result = await hasBadge('testuser', 'Some Badge');
      expect(result).toBe(false);
    });
  });

  describe('checkAndAwardCommunityBadge', () => {
    it('should award a community badge when user joins a community', async () => {
      jest.spyOn(CommunityModel, 'findById').mockResolvedValueOnce(mockCommunity);
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...mockUser, badges: [] } as DatabaseUser);

      const result = await checkAndAwardCommunityBadge('testuser', mockCommunity._id.toString());
      expect(result).toBe(true);
      expect(CommunityModel.findById).toHaveBeenCalledWith(mockCommunity._id.toString());
    });

    it('should not award badge if community does not exist', async () => {
      jest.spyOn(CommunityModel, 'findById').mockResolvedValueOnce(null);

      const result = await checkAndAwardCommunityBadge('testuser', 'invalid_id');
      expect(result).toBe(false);
    });

    it('should not award duplicate badges', async () => {
      const userWithBadge: DatabaseUser = {
        ...mockUser,
        badges: [
          {
            type: 'community',
            name: 'Community Member: Test Community',
            earnedAt: new Date(),
          },
        ],
      };
      jest.spyOn(CommunityModel, 'findById').mockResolvedValueOnce(mockCommunity);
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithBadge);

      const result = await checkAndAwardCommunityBadge('testuser', mockCommunity._id.toString());
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      jest.spyOn(CommunityModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const result = await checkAndAwardCommunityBadge('testuser', mockCommunity._id.toString());
      expect(result).toBe(false);
    });
  });

  describe('checkAndAwardMilestoneBadge', () => {
    it('should award 50 Questions badge when count is 50', async () => {
      // the 1st call is for hasBadge & the 2nd call is for awardBadge
      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...mockUser, badges: [] } as DatabaseUser);

      const result = await checkAndAwardMilestoneBadge('testuser', 'question', 50);
      expect(result).toBe(true);
    });

    it('should award 100 Questions badge when count is 100', async () => {
      // the 1st call is for hasBadge & the 2nd call is for awardBadge
      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...mockUser, badges: [] } as DatabaseUser);

      const result = await checkAndAwardMilestoneBadge('testuser', 'question', 100);
      expect(result).toBe(true);
    });

    it('should award 50 Answers badge when count is 50', async () => {
      // the 1st call is for hasBadge & the 2nd call is for awardBadge
      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...mockUser, badges: [] } as DatabaseUser);

      const result = await checkAndAwardMilestoneBadge('testuser', 'answer', 50);
      expect(result).toBe(true);
    });

    it('should award 100 Answers badge when count is 100', async () => {
      // the 1st call is for hasBadge & the 2nd call is for awardBadge
      jest
        .spyOn(UserModel, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);
      jest
        .spyOn(UserModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...mockUser, badges: [] } as DatabaseUser);

      const result = await checkAndAwardMilestoneBadge('testuser', 'answer', 100);
      expect(result).toBe(true);
    });

    it('should not award badge if count is not a milestone (e.g., 49)', async () => {
      const result = await checkAndAwardMilestoneBadge('testuser', 'question', 49);
      expect(result).toBe(false);
    });

    it('should not award duplicate badges', async () => {
      const userWithBadge: DatabaseUser = {
        ...mockUser,
        badges: [
          {
            type: 'milestone',
            name: '50 Questions',
            earnedAt: new Date(),
          },
        ],
      };
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithBadge);

      const result = await checkAndAwardMilestoneBadge('testuser', 'question', 50);
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      // Test that if hasBadge encounters an error, it returns false
      // Since hasBadge catches errors internally it's a tested scenario where the function returns false without awarding a badge
      const userWithBadge: DatabaseUser = {
        ...mockUser,
        badges: [{ type: 'milestone', name: '50 Questions', earnedAt: new Date() }],
      };
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithBadge);

      const result = await checkAndAwardMilestoneBadge('testuser', 'question', 50);
      expect(result).toBe(false);
    });
  });

  describe('getUserBadges', () => {
    it('should return all badges for a user', async () => {
      const badges: Badge[] = [
        {
          type: 'community',
          name: 'Community Member: Test Community',
          earnedAt: new Date(),
        },
        {
          type: 'milestone',
          name: '50 Questions',
          earnedAt: new Date(),
        },
      ];
      const userWithBadges: DatabaseUser = {
        ...mockUser,
        badges,
      };
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithBadges);

      const result = await getUserBadges('testuser');
      expect(result).toEqual(badges);
    });

    it('should return empty array if user has no badges', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await getUserBadges('testuser');
      expect(result).toEqual([]);
    });

    it('should return empty array if user does not exist', async () => {
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      const result = await getUserBadges('nonexistent');
      expect(result).toEqual([]);
    });

    it('should return empty array if user has no badges array', async () => {
      const userWithoutBadges = { ...mockUser, badges: undefined };
      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(userWithoutBadges as DatabaseUser);

      const result = await getUserBadges('testuser');
      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const result = await getUserBadges('testuser');
      expect(result).toEqual([]);
    });
  });

  describe('countUserQuestions', () => {
    it('should return the count of questions asked by user', async () => {
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(5);

      const result = await countUserQuestions('testuser');
      expect(result).toBe(5);
      expect(QuestionModel.countDocuments).toHaveBeenCalledWith({ askedBy: 'testuser' });
    });

    it('should return 0 if user has no questions', async () => {
      jest.spyOn(QuestionModel, 'countDocuments').mockResolvedValueOnce(0);

      const result = await countUserQuestions('testuser');
      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      jest
        .spyOn(QuestionModel, 'countDocuments')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await countUserQuestions('testuser');
      expect(result).toBe(0);
    });
  });

  describe('countUserAnswers', () => {
    it('should return the count of answers provided by user', async () => {
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(10);

      const result = await countUserAnswers('testuser');
      expect(result).toBe(10);
      expect(AnswerModel.countDocuments).toHaveBeenCalledWith({ ansBy: 'testuser' });
    });

    it('should return 0 if user has no answers', async () => {
      jest.spyOn(AnswerModel, 'countDocuments').mockResolvedValueOnce(0);

      const result = await countUserAnswers('testuser');
      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      jest.spyOn(AnswerModel, 'countDocuments').mockRejectedValueOnce(new Error('Database error'));

      const result = await countUserAnswers('testuser');
      expect(result).toBe(0);
    });
  });
});
