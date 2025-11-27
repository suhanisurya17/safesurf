import { useState, useEffect } from 'react';
import SwipeDeck from './components/SwipeDeck';
import Scoreboard from './components/Scoreboard';
import { updateLevel, updateStreak } from './utils/scoring';

// API to get examples from extension or fallback
async function getExamples() {
  // Try to get from extension first
  if (window.swipesleuthAPI) {
    try {
      const examples = await window.swipesleuthAPI.requestExamples();
      return examples;
    } catch (error) {
      console.warn('Extension not available, using fallback:', error);
    }
  }
  
  // Fallback: return empty array (extension should provide data)
  return [];
}

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoints: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentStreak: 0,
    bestStreak: 0
  });

  useEffect(() => {
    loadExamples();
    loadStats();
  }, []);

  const loadExamples = async () => {
    setLoading(true);
    try {
      const examples = await getExamples();
      // Shuffle cards
      const shuffled = [...examples].sort(() => Math.random() - 0.5);
      setCards(shuffled);
    } catch (error) {
      console.error('Failed to load examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    // Load from chrome.storage if available (extension context)
    // For web, use localStorage as fallback
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['userStats'], (result) => {
        if (result.userStats) {
          setStats(updateLevel(result.userStats));
        }
      });
    } else {
      const saved = localStorage.getItem('swipesleuth-stats');
      if (saved) {
        setStats(updateLevel(JSON.parse(saved)));
      }
    }
  };

  const saveStats = (newStats) => {
    const updatedStats = updateLevel(newStats);
    setStats(updatedStats);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ userStats: updatedStats });
    } else {
      localStorage.setItem('swipesleuth-stats', JSON.stringify(updatedStats));
    }
  };

  const handleScoreUpdate = (result) => {
    const newStats = {
      ...stats,
      totalPoints: stats.totalPoints + result.points,
      totalAnswers: stats.totalAnswers + 1,
      correctAnswers: stats.correctAnswers + (result.correct ? 1 : 0)
    };
    
    const withStreak = updateStreak(newStats, result.correct);
    saveStats(withStreak);
  };

  const handleGameComplete = () => {
    // Could trigger celebration, show summary, etc.
    console.log('Game complete!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading examples...</div>
          <div className="text-sm">Make sure the SwipeSleuth extension is installed and enabled</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">SwipeSleuth</h1>
          <p className="text-white text-lg opacity-90">Learn to spot scams by swiping through examples</p>
        </header>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SwipeDeck
              cards={cards}
              onScoreUpdate={handleScoreUpdate}
              onGameComplete={handleGameComplete}
            />
          </div>
          
          <div className="md:col-span-1">
            <Scoreboard stats={stats} />
            
            <button
              onClick={loadExamples}
              className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mb-4"
            >
              New Game
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-4 text-sm text-gray-600">
              <p className="mb-2"><strong>Swipe Right</strong> = Scam</p>
              <p><strong>Swipe Left</strong> = Safe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

