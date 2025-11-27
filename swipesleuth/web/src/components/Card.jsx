import { useState } from 'react';

export default function Card({ card, onSwipe, isActive }) {
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!dragStart) return;
    const touch = e.touches[0];
    const offsetX = touch.clientX - dragStart.x;
    const offsetY = touch.clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleTouchEnd = () => {
    if (!dragStart) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    
    setDragStart(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragStart || !isDragging) return;
    const offsetX = e.clientX - dragStart.x;
    const offsetY = e.clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    if (!dragStart) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0);
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    
    setDragStart(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  if (!card) return null;

  const rotation = dragOffset.x * 0.1;
  const opacity = isActive ? 1 : 0.5;

  return (
    <div
      className={`absolute w-full max-w-md mx-auto cursor-grab active:cursor-grabbing transition-transform ${
        isActive ? 'z-10' : 'z-0'
      }`}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            card.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {card.difficulty.toUpperCase()}
          </span>
          {card.isScam && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              SCAM
            </span>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{card.title}</h2>
        
        <div className="flex-1 mb-4">
          <p className="text-gray-600 mb-4 leading-relaxed">{card.text}</p>
          
          <div className="text-sm text-gray-500 mb-4">
            <strong>URL:</strong> <span className="font-mono break-all">{card.url}</span>
          </div>
          
          {card.redFlags && card.redFlags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Red Flags:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {card.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-center space-x-4 mt-auto pt-4 border-t">
          <button
            onClick={() => onSwipe(false)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            ← Safe
          </button>
          <button
            onClick={() => onSwipe(true)}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Scam →
          </button>
        </div>
      </div>
    </div>
  );
}

