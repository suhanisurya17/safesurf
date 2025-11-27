// Scoring utilities for SwipeSleuth

/**
 * Score a user's response to a card
 * @param {Object} card - The card object with isScam property
 * @param {boolean} userChoice - true if user swiped right (scam), false if left (safe)
 * @returns {Object} - { correct: boolean, points: number, message: string }
 */
export function scoreResponse(card, userChoice) {
  const isCorrect = card.isScam === userChoice;
  
  // Base points by difficulty
  const basePoints = {
    easy: 10,
    medium: 20,
    hard: 30
  };
  
  const points = isCorrect ? basePoints[card.difficulty] || 10 : 0;
  
  let message = '';
  if (isCorrect) {
    if (card.isScam) {
      message = 'Correct! You spotted the scam.';
    } else {
      message = 'Correct! This is legitimate.';
    }
  } else {
    if (card.isScam) {
      message = 'Incorrect. This was a scam.';
    } else {
      message = 'Incorrect. This was legitimate.';
    }
  }
  
  return {
    correct: isCorrect,
    points,
    message,
    redFlags: card.redFlags || []
  };
}

/**
 * Update user level based on stats
 * @param {Object} userStats - Current user statistics
 * @returns {Object} - Updated stats with level information
 */
export function updateLevel(userStats) {
  const { totalPoints = 0, correctAnswers = 0, totalAnswers = 0 } = userStats;
  
  // Level calculation: every 100 points = 1 level
  const level = Math.floor(totalPoints / 100) + 1;
  
  // Calculate accuracy
  const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  
  // Calculate XP needed for next level
  const currentLevelPoints = (level - 1) * 100;
  const nextLevelPoints = level * 100;
  const xpProgress = totalPoints - currentLevelPoints;
  const xpNeeded = nextLevelPoints - totalPoints;
  
  // Determine streak status
  const currentStreak = userStats.currentStreak || 0;
  const bestStreak = userStats.bestStreak || 0;
  
  // Badge calculation
  const badges = [];
  if (level >= 5) badges.push('Novice Detective');
  if (level >= 10) badges.push('Scam Spotter');
  if (level >= 20) badges.push('Fraud Fighter');
  if (accuracy >= 80 && totalAnswers >= 20) badges.push('Sharp Eye');
  if (bestStreak >= 10) badges.push('Hot Streak');
  if (totalAnswers >= 50) badges.push('Dedicated');
  
  return {
    ...userStats,
    level,
    accuracy: Math.round(accuracy * 10) / 10,
    xpProgress,
    xpNeeded,
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    badges
  };
}

/**
 * Calculate streak
 * @param {Object} userStats - Current stats
 * @param {boolean} isCorrect - Whether the last answer was correct
 * @returns {Object} - Updated stats with streak
 */
export function updateStreak(userStats, isCorrect) {
  const currentStreak = userStats.currentStreak || 0;
  const bestStreak = userStats.bestStreak || 0;
  
  let newStreak = 0;
  if (isCorrect) {
    newStreak = currentStreak + 1;
  }
  
  return {
    ...userStats,
    currentStreak: newStreak,
    bestStreak: Math.max(bestStreak, newStreak)
  };
}

