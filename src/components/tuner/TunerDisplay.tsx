import React from 'react';

interface TunerDisplayProps {
  note: string;
  frequency: number | null;
  detune: number;
}

const TunerDisplay: React.FC<TunerDisplayProps> = ({ note, frequency, detune }) => {
  // Calculate the needle position based on detune value
  const needleRotation = Math.min(Math.max(detune * 0.6, -45), 45);
  
  // Determine tuning status and colors
  const getTuningStatus = () => {
    if (Math.abs(detune) < 5) return { text: '正確', color: 'text-green-500' };
    if (detune > 0) return { text: '高すぎ', color: 'text-red-500' };
    return { text: '低すぎ', color: 'text-red-500' };
  };

  const status = getTuningStatus();

  return (
    <div className="w-full max-w-lg mx-auto px-2">
      {/* Main display card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 w-full mx-auto">
        {/* Note display */}
        <div className="text-center mb-8">
          <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {note}
          </div>
          <div className="text-gray-400 mt-2">
            {frequency !== null ? `${frequency.toFixed(1)} Hz` : '-- Hz'}
          </div>
        </div>

        {/* Tuning meter */}
        <div className="relative w-full h-48 mb-6">
          {/* Meter scale */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-700">
            {/* Scale markers */}
            {[-30, -15, 0, 15, 30].map((mark) => (
              <div
                key={mark}
                className="absolute h-3 w-[2px] bg-gray-600"
                style={{
                  left: `${((mark + 45) / 90) * 100}%`,
                  top: '-6px',
                }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                  {mark}
                </div>
              </div>
            ))}
          </div>

          {/* Center marker */}
          <div className="absolute top-1/2 left-1/2 w-[3px] h-5 bg-green-500 -translate-x-1/2 -translate-y-1/2" />

          {/* Needle */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-150"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          >
            <div className="w-[4px] h-40 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-full" />
            <div className="w-4 h-4 rounded-full bg-blue-400 absolute bottom-0 left-1/2 -translate-x-1/2 shadow-lg" />
          </div>
        </div>

        {/* Tuning status */}
        <div className="text-center">
          <div className={`text-xl font-medium ${status.color} transition-colors duration-300`}>
            {status.text}
          </div>
          <div className="text-gray-400 text-sm mt-1">
            {detune > 0 ? `+${detune}` : detune} セント
          </div>
        </div>
      </div>
    </div>
  );
};

export default TunerDisplay;