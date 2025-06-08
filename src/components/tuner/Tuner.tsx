import React, { useState, useEffect, useRef } from 'react';
import { useAudioContext } from '../../context/AudioContextProvider';
import TunerDisplay from './TunerDisplay';
import GuitarStrings from './GuitarStrings';
import { PitchDetector  } from 'pitchy';
import { Mic, MicOff } from 'lucide-react';

const Tuner: React.FC = () => {
  const { audioContext, analyser, startAudio, isAudioInitialized } = useAudioContext();
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<string>('-');
  const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
  const [detuneAmount, setDetuneAmount] = useState<number>(0);
  const [selectedString, setSelectedString] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);


  // Standard guitar tuning frequencies
  const standardTuning = {
    'E2': 82.41,
    'A2': 110.00,
    'D3': 146.83,
    'G3': 196.00,
    'B3': 246.94,
    'E4': 329.63
  };

  // Note name lookup
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Get note name and octave from frequency
  const getNote = (frequency: number) => {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const noteInt = Math.round(noteNum) + 69; // A4 (440Hz) is MIDI note 69
    const octave = Math.floor(noteInt / 12) - 1;
    const noteName = noteNames[noteInt % 12];
    return { name: noteName, octave, fullName: `${noteName}${octave}` };
  };

  // Get closest target frequency from standard tuning
  const getClosestNote = (frequency: number) => {
    const note = getNote(frequency);
    const fullNote = note.fullName;
    
    // Check if this note is in our standard tuning
    if (standardTuning[fullNote as keyof typeof standardTuning]) {
      return { target: standardTuning[fullNote as keyof typeof standardTuning], noteName: fullNote };
    }
    
    // Find closest note in standard tuning
    let closestDiff = Infinity;
    let closestNote = '';
    let targetFreq = 0;
    
    Object.entries(standardTuning).forEach(([note, freq]) => {
      const diff = Math.abs(Math.log2(frequency / freq));
      if (diff < closestDiff) {
        closestDiff = diff;
        closestNote = note;
        targetFreq = freq;
      }
    });
    
    return { target: targetFreq, noteName: closestNote };
  };

  // Calculate detuning
  const calculateDetune = (actual: number, target: number) => {
    const ratio = actual / target;
    const cents = 1200 * Math.log2(ratio);
    return Math.round(cents);
  };

  const analyze = () => {
    if (!analyser || !isListening) return;
    
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    const detector = PitchDetector.forFloat32Array(dataArray.length);
    const [pitch, clarity] = detector.findPitch(dataArray, audioContext!.sampleRate);
    console.log('🔍 pitch:', pitch, 'clarity:', clarity);
    
    if (clarity > 0.6 && pitch > 20 && pitch < 1500) {
      const { name, octave, } = getNote(pitch);
      const { target, noteName } = getClosestNote(pitch);
      const detune = calculateDetune(pitch, target);
      
      setCurrentFrequency(Math.round(pitch * 10) / 10);
      setCurrentNote(`${name}${octave}`);
      setDetuneAmount(detune);
      
      if (selectedString && noteName !== selectedString) {
        setSelectedString(null);
      }
    }
    
    animationRef.current = requestAnimationFrame(analyze);
  };

  const toggleListening = async () => {
    if (!isListening) {
      if (!isAudioInitialized) {
        await startAudio();
      }
      setIsListening(true);
    } else {
      setIsListening(false);
    }
  };

  const handleStringSelect = (stringName: string) => {
    setSelectedString(stringName);
    // Reset display to show target note
    const targetFreq = standardTuning[stringName as keyof typeof standardTuning];
    const { name, octave } = getNote(targetFreq);
    setCurrentNote(`${name}${octave}`);
    setCurrentFrequency(targetFreq);
    setDetuneAmount(0);
  };

  useEffect(() => {
    if (isListening) {
      animationRef.current = requestAnimationFrame(analyze);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, analyser]);

  return (
    <div className="flex flex-col justify-start w-full max-w-screen-lg mx-auto px-6 pt-24">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-1">ギターチューナー</h2>
        <p className="text-sm text-gray-600">楽器を標準的なギターチューニングに合わせましょう</p>
      </div>
    <div className="mb-4">
      <TunerDisplay 
        note={currentNote} 
        frequency={currentFrequency} 
        detune={detuneAmount} 
      />
    </div>
    <div className="mb-4">
      <GuitarStrings 
        onSelectString={handleStringSelect} 
        selectedString={selectedString}
      />
    </div>
      <div className="mt-8">
        <button
          onClick={toggleListening}
          className={`flex items-center justify-center px-6 py-3 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors shadow-md`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              停止
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              開始
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Tuner;