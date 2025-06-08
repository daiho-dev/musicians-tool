import React from 'react';

interface SpeedControlsProps {
  playbackRate: number;
  onRateChange: (rate: number) => void;
}

const SpeedControls: React.FC<SpeedControlsProps> = ({ playbackRate, onRateChange }) => {
  // Available speed presets
  const speedPresets = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  
  // Handle slider change
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(event.target.value);
    onRateChange(rate);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-gray-700 font-medium">
          再生速度
        </label>
        <span className="text-blue-600 font-bold">
          {playbackRate.toFixed(2)}倍
        </span>
      </div>
      
      {/* Speed slider */}
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.05"
        value={playbackRate}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      
      {/* Speed presets */}
      <div className="flex justify-between mt-4">
        {speedPresets.map((speed) => (
          <button
            key={speed}
            onClick={() => onRateChange(speed)}
            className={`px-2 py-1 text-xs rounded ${
              Math.abs(playbackRate - speed) < 0.01
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
          >
            {speed.toFixed(2)}倍
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedControls;