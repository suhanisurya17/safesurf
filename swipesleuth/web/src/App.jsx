import { useState, useEffect } from 'react';
import SwipeDeck from './components/SwipeDeck';
import Scoreboard from './components/Scoreboard';
import { updateLevel, updateStreak } from './utils/scoring';

// API to get examples from extension or fallback
async function getExamples() {
  // Try to get from extension first
  if (window.swipesleuthAPI && typeof window.swipesleuthAPI.requestExamples === 'function') {
    try {
      console.log('[App] Requesting examples from extension...');
      const examples = await window.swipesleuthAPI.requestExamples();
      console.log('[App] Received', examples?.length || 0, 'examples from extension');
      return examples || [];
    } catch (error) {
      console.warn('[App] Extension request failed:', error);
    }
  } else {
    console.warn('[App] Extension API not available');
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
      // Wait a bit for content script to inject API
      let retries = 0;
      while (!window.swipesleuthAPI && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        retries++;
      }
      
      const examples = await getExamples();
      
      if (examples && examples.length > 0) {
        // Shuffle cards
        const shuffled = [...examples].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        console.log('[App] Loaded', shuffled.length, 'cards');
      } else {
        console.warn('[App] No examples received');
        setCards([]);
      }
    } catch (error) {
      console.error('Failed to load examples:', error);
      setCards([]);
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
          <div className="text-sm mb-2">Make sure the SwipeSleuth extension is installed and enabled</div>
          {!window.swipesleuthAPI && (
            <div className="text-xs text-yellow-200 mt-2">
              Waiting for extension connection...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (cards.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <div className="text-2xl mb-4">No examples available</div>
          <div className="text-sm mb-4">
            {!window.swipesleuthAPI ? (
              <div>
                <p className="mb-2">Extension not detected. Please:</p>
                <ol className="list-decimal list-inside text-left space-y-1">
                  <li>Install the SwipeSleuth extension</li>
                  <li>Reload this page</li>
                  <li>Make sure extension is enabled</li>
                </ol>
              </div>
            ) : (
              <div>
                <p>Extension detected but no examples received.</p>
                <p className="mt-2">Try clicking "New Game" or check the extension popup.</p>
              </div>
            )}
          </div>
          <button
            onClick={loadExamples}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Retry
          </button>
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

