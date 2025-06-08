import React from 'react';

type Props = {
  onSelectString: (stringName: string) => void;
  selectedString: string | null;
};

const strings = [
  { name: '1弦 (E4)', key: 'E4' },
  { name: '2弦 (B3)', key: 'B3' },
  { name: '3弦 (G3)', key: 'G3' },
  { name: '4弦 (D3)', key: 'D3' },
  { name: '5弦 (A2)', key: 'A2' },
  { name: '6弦 (E2)', key: 'E2' },
];

const GuitarStrings: React.FC<Props> = ({ onSelectString, selectedString }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {strings.map((string) => (
        <button
          key={string.key}
          onClick={() => onSelectString(string.key)}
          className={`py-2 px-4 border rounded text-sm text-center ${
            selectedString === string.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
          }`}
        >
          {string.name}
        </button>
      ))}
    </div>
  );
};

export default GuitarStrings;