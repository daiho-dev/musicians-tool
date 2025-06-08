import React from 'react';

interface MetronomeVisualProps {
  isPlaying: boolean;
  count: number;
  beatsPerMeasure: number;
}

const MetronomeVisual: React.FC<MetronomeVisualProps> = ({ 
  isPlaying,
  count, 
  beatsPerMeasure
}) => {
  // Create array of beat indicators
  const beats = Array.from({ length: beatsPerMeasure }, (_, i) => i);

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-center space-x-2">
        {beats.map((beatIndex) => (
          <div
            key={beatIndex}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
              isPlaying && beatIndex === count
                ? beatIndex === 0
                  ? 'bg-red-500 scale-110'
                  : 'bg-blue-500 scale-110'
                : 'bg-gray-200'
            }`}
          >
            <span className={`text-sm font-medium ${
              isPlaying && beatIndex === count ? 'text-white' : 'text-gray-700'
            }`}>
              {beatIndex + 1}
            </span>
          </div>
        ))}
      </div>
      
      {/* Pendulum visualization */}
      {isPlaying && (
        <div className="mt-4 h-20 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -ml-1 w-2 h-20 flex flex-col items-center">
            <div className="w-2 h-16 bg-gray-300"></div>
            <div className="w-4 h-4 rounded-full bg-blue-600 animate-swing"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetronomeVisual;