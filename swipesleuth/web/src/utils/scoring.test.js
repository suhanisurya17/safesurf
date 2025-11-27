import { describe, it, expect } from 'vitest';
import { scoreResponse, updateLevel, updateStreak } from './scoring';

describe('scoring utilities', () => {
  describe('scoreResponse', () => {
    it('should award points for correct easy answer', () => {
      const card = { isScam: true, difficulty: 'easy' };
      const result = scoreResponse(card, true);
      expect(result.correct).toBe(true);
      expect(result.points).toBe(10);
    });

    it('should award points for correct medium answer', () => {
      const card = { isScam: true, difficulty: 'medium' };
      const result = scoreResponse(card, true);
      expect(result.correct).toBe(true);
      expect(result.points).toBe(20);
    });

    it('should award points for correct hard answer', () => {
      const card = { isScam: true, difficulty: 'hard' };
      const result = scoreResponse(card, true);
      expect(result.correct).toBe(true);
      expect(result.points).toBe(30);
    });

    it('should not award points for incorrect answer', () => {
      const card = { isScam: true, difficulty: 'easy' };
      const result = scoreResponse(card, false);
      expect(result.correct).toBe(false);
      expect(result.points).toBe(0);
    });

    it('should correctly identify safe cards', () => {
      const card = { isScam: false, difficulty: 'medium' };
      const result = scoreResponse(card, false);
      expect(result.correct).toBe(true);
      expect(result.message).toContain('legitimate');
    });

    it('should include red flags in response', () => {
      const card = {
        isScam: true,
        difficulty: 'easy',
        redFlags: ['Urgent action', 'Suspicious domain']
      };
      const result = scoreResponse(card, true);
      expect(result.redFlags).toEqual(['Urgent action', 'Suspicious domain']);
    });
  });

  describe('updateLevel', () => {
    it('should calculate level based on points', () => {
      const stats = { totalPoints: 250, correctAnswers: 10, totalAnswers: 15 };
      const updated = updateLevel(stats);
      expect(updated.level).toBe(3); // 250 / 100 = 2.5, floor = 2, +1 = 3
    });

    it('should calculate accuracy correctly', () => {
      const stats = { totalPoints: 100, correctAnswers: 8, totalAnswers: 10 };
      const updated = updateLevel(stats);
      expect(updated.accuracy).toBe(80.0);
    });

    it('should calculate XP progress', () => {
      const stats = { totalPoints: 150, correctAnswers: 5, totalAnswers: 10 };
      const updated = updateLevel(stats);
      expect(updated.xpProgress).toBe(50); // 150 - 100 = 50
      expect(updated.xpNeeded).toBe(50); // 200 - 150 = 50
    });

    it('should award badges based on level', () => {
      const stats = { totalPoints: 500, correctAnswers: 20, totalAnswers: 25 };
      const updated = updateLevel(stats);
      expect(updated.badges).toContain('Novice Detective');
      expect(updated.badges).toContain('Scam Spotter');
    });

    it('should handle zero answers', () => {
      const stats = { totalPoints: 0, correctAnswers: 0, totalAnswers: 0 };
      const updated = updateLevel(stats);
      expect(updated.level).toBe(1);
      expect(updated.accuracy).toBe(0);
    });
  });

  describe('updateStreak', () => {
    it('should increment streak on correct answer', () => {
      const stats = { currentStreak: 3, bestStreak: 5 };
      const updated = updateStreak(stats, true);
      expect(updated.currentStreak).toBe(4);
      expect(updated.bestStreak).toBe(5);
    });

    it('should reset streak on incorrect answer', () => {
      const stats = { currentStreak: 5, bestStreak: 5 };
      const updated = updateStreak(stats, false);
      expect(updated.currentStreak).toBe(0);
      expect(updated.bestStreak).toBe(5);
    });

    it('should update best streak when current exceeds it', () => {
      const stats = { currentStreak: 8, bestStreak: 7 };
      const updated = updateStreak(stats, true);
      expect(updated.currentStreak).toBe(9);
      expect(updated.bestStreak).toBe(9);
    });
  });
});

