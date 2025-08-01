import React from 'react';

interface TimeSignatureSelectorProps {
  timeSignature: { beats: number; value: number };
  onChange: (timeSignature: { beats: number; value: number }) => void;
}

const TimeSignatureSelector: React.FC<TimeSignatureSelectorProps> = ({ 
  timeSignature, 
  onChange 
}) => {
  const commonSignatures = [
    { beats: 2, value: 4, label: '2/4' },
    { beats: 3, value: 4, label: '3/4' },
    { beats: 4, value: 4, label: '4/4' },
    { beats: 6, value: 8, label: '6/8' }
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block text-gray-700 font-medium mb-2">拍子記号</label>
      <div className="grid grid-cols-4 gap-2">
        {commonSignatures.map((sig) => (
          <button
            key={sig.label}
            onClick={() => onChange(sig)}
            className={`py-2 px-4 rounded-lg text-center transition-colors ${
              timeSignature.beats === sig.beats && timeSignature.value === sig.value
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-white hover:bg-blue-50 text-gray-800 border border-gray-200'
            }`}
          >
            {sig.label}
          </button>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm mb-1">小節あたりの拍数</label>
          <select
            value={timeSignature.beats}
            onChange={(e) => onChange({ ...timeSignature, beats: parseInt(e.target.value, 10) })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm mb-1">拍の単位</label>
          <select
            value={timeSignature.value}
            onChange={(e) => onChange({ ...timeSignature, value: parseInt(e.target.value, 10) })}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white"
          >
            {[2, 4, 8, 16].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimeSignatureSelector;