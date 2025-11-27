export default function Scoreboard({ stats }) {
  if (!stats) return null;

  const { level, totalPoints, accuracy, currentStreak, bestStreak, badges, xpProgress, xpNeeded } = stats;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Progress</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{level}</div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">{totalPoints || 0}</div>
          <div className="text-sm text-gray-600">Points</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">{accuracy.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-sm text-gray-600">Streak</div>
        </div>
      </div>
      
      {xpNeeded > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>XP Progress</span>
            <span>{xpProgress} / {xpProgress + xpNeeded}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(xpProgress / (xpProgress + xpNeeded)) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {bestStreak > 0 && (
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-600">Best Streak: </span>
          <span className="font-bold text-orange-600">{bestStreak}</span>
        </div>
      )}
      
      {badges && badges.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

