import { useState, useEffect } from 'react';
import Card from './Card';
import { scoreResponse, updateLevel, updateStreak } from '../utils/scoring';

export default function SwipeDeck({ cards, onScoreUpdate, onGameComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0) {
      onGameComplete?.();
    }
  }, [currentIndex, cards.length, onGameComplete]);

  const handleSwipe = (isScam) => {
    if (isAnimating || currentIndex >= cards.length) return;
    
    setIsAnimating(true);
    const card = cards[currentIndex];
    const result = scoreResponse(card, isScam);
    
    setFeedback({
      correct: result.correct,
      message: result.message,
      points: result.points,
      redFlags: result.redFlags
    });
    
    // Update score
    onScoreUpdate?.(result);
    
    // Move to next card after delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
      setIsAnimating(false);
    }, 2000);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center text-white text-xl py-20">
        <p>No cards available. Loading examples...</p>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="text-center text-white py-20">
        <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
        <p className="text-xl">Great job spotting those scams!</p>
      </div>
    );
  }

  // Show next 2 cards in stack
  const visibleCards = [];
  for (let i = 0; i < Math.min(3, cards.length - currentIndex); i++) {
    visibleCards.push(cards[currentIndex + i]);
  }

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ height: '500px' }}>
      {visibleCards.map((card, idx) => (
        <Card
          key={card.id || currentIndex + idx}
          card={card}
          onSwipe={handleSwipe}
          isActive={idx === 0}
        />
      ))}
      
      {feedback && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-6 rounded-2xl shadow-2xl ${
          feedback.correct ? 'bg-green-500' : 'bg-red-500'
        } text-white text-center min-w-[300px]`}>
          <div className="text-4xl mb-2">{feedback.correct ? '✓' : '✗'}</div>
          <div className="text-xl font-bold mb-2">{feedback.message}</div>
          {feedback.points > 0 && (
            <div className="text-lg">+{feedback.points} points</div>
          )}
          {feedback.redFlags && feedback.redFlags.length > 0 && !feedback.correct && (
            <div className="mt-4 text-sm">
              <div className="font-semibold mb-2">Red Flags to watch for:</div>
              <ul className="list-disc list-inside text-left">
                {feedback.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

