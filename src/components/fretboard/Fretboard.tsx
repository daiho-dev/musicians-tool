import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Note {
  name: string;
  frequency: number;
}

const Fretboard: React.FC = () => {
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<{ string: number; fret: number; note: string } | null>(null);
  
  // Standard tuning string notes (from lowest to highest)
  const strings = [
    { name: 'E2', frequency: 82.41 }, // 6th string
    { name: 'A2', frequency: 110.00 }, // 5th string
    { name: 'D3', frequency: 146.83 }, // 4th string
    { name: 'G3', frequency: 196.00 }, // 3rd string
    { name: 'B3', frequency: 246.94 }, // 2nd string
    { name: 'E4', frequency: 329.63 }  // 1st string
  ];
  
  // Number of frets to display
  const frets = 12;
  
  // Note names
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Calculate note for a given string and fret
  const calculateNote = (stringIndex: number, fret: number): Note => {
    const openNote = strings[stringIndex];
    const openNoteNameIndex = noteNames.indexOf(openNote.name.charAt(0) + (openNote.name.charAt(1) === '#' ? '#' : ''));
    const noteIndex = (openNoteNameIndex + fret) % 12;
    const octave = parseInt(openNote.name.slice(-1)) + Math.floor((openNoteNameIndex + fret) / 12);
    const noteName = `${noteNames[noteIndex]}${octave}`;
    
    // Calculate frequency using equal temperament formula: f = f0 * 2^(n/12)
    const frequency = openNote.frequency * Math.pow(2, fret / 12);
    
    return { name: noteName, frequency };
  };
  
  // Handle click on fret position
  const handleFretClick = (stringIndex: number, fret: number) => {
    const note = calculateNote(stringIndex, fret);
    setSelectedNote({
      string: 6 - stringIndex, // Convert to string number (1-6)
      fret,
      note: note.name
    });
    
    // Play the note sound
    playNoteSound(note.frequency);
  };
  
  // Play a note with Web Audio API
  const playNoteSound = (frequency: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    
    gainNode.gain.value = 0.3;
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  };
  
  // Toggle note display
  const toggleNoteDisplay = () => {
    setShowNotes(!showNotes);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-screen-md mx-auto px-4 pt-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Guitar Fretboard Trainer</h2>
        <p className="text-gray-600">Learn the notes on the guitar fretboard</p>
      </div>
      
      {/* Selected note display */}
      <div className="w-full bg-white rounded-lg shadow-md p-4 mb-6 text-center">
        {selectedNote ? (
          <>
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {selectedNote.note.slice(0, -1)}
              <span className="text-xl text-gray-500">{selectedNote.note.slice(-1)}</span>
            </div>
            <div className="text-gray-600">
              String {selectedNote.string}, Fret {selectedNote.fret}
            </div>
          </>
        ) : (
          <div className="text-gray-500">
            Click on the fretboard to see note information
          </div>
        )}
      </div>
      
      {/* Fretboard */}
      <div className="w-full overflow-x-auto mb-6">
        <div className="fretboard min-w-max" style={{ paddingLeft: '40px' }}>
          {/* Fret numbers */}
          <div className="flex">
            <div className="w-10 flex-shrink-0"></div>
            {[...Array(frets + 1)].map((_, fretIndex) => (
              <div 
                key={fretIndex} 
                className="w-14 text-center text-xs text-gray-600 pb-1"
              >
                {fretIndex}
              </div>
            ))}
          </div>
          
          {/* Strings and frets */}
          {strings.map((string, stringIndex) => (
            <div key={stringIndex} className="flex items-center border-b border-gray-300 last:border-b-0">
              {/* String name */}
              <div className="w-10 flex-shrink-0 pr-2 text-right text-sm font-medium text-gray-700">
                {string.name.charAt(0)}{string.name.slice(1)}
              </div>
              
              {/* Frets */}
              {[...Array(frets + 1)].map((_, fretIndex) => {
                const note = calculateNote(stringIndex, fretIndex);
                const isNut = fretIndex === 0;
                const isMarker = [3, 5, 7, 9, 12].includes(fretIndex);
                
                return (
                  <div 
                    key={fretIndex} 
                    className={`relative w-14 h-10 flex items-center justify-center border-r border-gray-400 ${
                      isNut ? 'bg-gray-200 border-r-2' : ''
                    } ${isMarker && stringIndex === 2 ? 'marker' : ''}`}
                    onClick={() => handleFretClick(stringIndex, fretIndex)}
                  >
                    {/* String line */}
                    <div className="absolute w-full h-0.5 bg-gray-500"></div>
                    
                    {/* Fret markers */}
                    {isMarker && stringIndex === 2 && (
                      <div className="absolute w-4 h-4 rounded-full bg-gray-300 z-0"></div>
                    )}
                    
                    {/* Note name */}
                    {(showNotes || (selectedNote && 
                        selectedNote.string === 6 - stringIndex && 
                        selectedNote.fret === fretIndex)) && (
                      <div className="absolute z-10 bg-blue-600 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
                        {note.name.slice(0, -1)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Controls */}
      <div className="w-full flex justify-center mb-4">
        <button
          onClick={toggleNoteDisplay}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
        >
          {showNotes ? (
            <>
              <EyeOff className="w-5 h-5 mr-2" />
              Hide Notes
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 mr-2" />
              Show Notes
            </>
          )}
        </button>
      </div>
      
      {/* Instructions */}
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-medium mb-2">How to use:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click on any position on the fretboard to see the note name</li>
          <li>Use the "Show Notes" button to display all notes on the fretboard</li>
          <li>Each click will play the sound of the selected note</li>
          <li>Practice regularly to memorize the entire fretboard</li>
        </ul>
      </div>
    </div>
  );
};

export default Fretboard;