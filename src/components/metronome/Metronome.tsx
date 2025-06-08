import React, { useState, useRef, useEffect } from 'react';
import { Clock, Play, Square } from 'lucide-react';
import MetronomeVisual from './MetronomeVisual';
import TimeSignatureSelector from './TimeSignatureSelector';

const Metronome: React.FC = () => {
  const [bpm, setBpm] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [timeSignature, setTimeSignature] = useState<{ beats: number; value: number }>({ beats: 4, value: 4 });
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  
  const audioContext = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef<number>(0);
  const timerID = useRef<number | null>(null);
  const lastTapTime = useRef<number | null>(null);

  // Initialize audio context on component mount
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close();
      }
    };
  }, []);

  // Schedule metronome notes
  const scheduleNote = (time: number) => {
    // Create oscillator
    const osc = audioContext.current!.createOscillator();
    const envelope = audioContext.current!.createGain();
    
    // Set properties based on beat (first beat is accented)
    if (count % timeSignature.beats === 0) {
      osc.frequency.value = 800; // Higher frequency for first beat
      envelope.gain.value = 0.6;
    } else {
      osc.frequency.value = 600;
      envelope.gain.value = 0.3;
    }
    
    // Connect and schedule
    osc.connect(envelope);
    envelope.connect(audioContext.current!.destination);
    
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.start(time);
    osc.stop(time + 0.1);
    
    // Update beat counter
    setCount((prevCount) => (prevCount + 1) % timeSignature.beats);
  };

  // Scheduler function that runs periodically
  const scheduler = () => {
    const lookAhead = 0.1; // Look ahead time in seconds
    const scheduleAheadTime = 0.1; // How far ahead to schedule notes
    
    while (nextNoteTime.current < audioContext.current!.currentTime + scheduleAheadTime) {
      scheduleNote(nextNoteTime.current);
      
      // Calculate next note time
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTime.current += secondsPerBeat;
    }
    
    timerID.current = window.setTimeout(scheduler, lookAhead * 1000);
  };

  // Start or stop the metronome
  const togglePlay = () => {
    if (isPlaying) {
      // Stop
      if (timerID.current) {
        clearTimeout(timerID.current);
        timerID.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start
      if (audioContext.current!.state === 'suspended') {
        audioContext.current!.resume();
      }
      
      setCount(0);
      nextNoteTime.current = audioContext.current!.currentTime;
      scheduler();
      setIsPlaying(true);
    }
  };

  // Handle BPM change
  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(event.target.value, 10);
    setBpm(newBpm);
  };

  // Handle tap tempo
  const handleTapTempo = () => {
    const now = performance.now();
    
    if (lastTapTime.current) {
      const newTapTimes = [...tapTimes];
      const interval = now - lastTapTime.current;
      
      // Only consider taps within reasonable range (300ms to 2000ms)
      if (interval > 300 && interval < 2000) {
        newTapTimes.push(interval);
        
        // Keep only the last 4 taps
        if (newTapTimes.length > 4) {
          newTapTimes.shift();
        }
        
        setTapTimes(newTapTimes);
        
        // Calculate average interval and convert to BPM
        if (newTapTimes.length >= 2) {
          const avgInterval = newTapTimes.reduce((sum, val) => sum + val, 0) / newTapTimes.length;
          const newBpm = Math.round(60000 / avgInterval);
          
          // Clamp BPM to valid range
          if (newBpm >= 40 && newBpm <= 208) {
            setBpm(newBpm);
          }
        }
      }
    }
    
    lastTapTime.current = now;
  };

  // Reset tap tempo after inactivity
  useEffect(() => {
    const resetTapTimeout = setTimeout(() => {
      if (lastTapTime.current && performance.now() - lastTapTime.current > 2000) {
        lastTapTime.current = null;
        setTapTimes([]);
      }
    }, 2000);
    
    return () => clearTimeout(resetTapTimeout);
  }, [tapTimes]);

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-md mx-auto py-4 pt-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">メトロノーム</h2>
        <p className="text-gray-600">テンポと拍子を設定してください</p>
      </div>
      
      <MetronomeVisual 
        isPlaying={isPlaying} 
        count={count} 
        beatsPerMeasure={timeSignature.beats} 
      />
      
      <div className="w-full max-w-screen-md mx-auto px-4 pt-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="bpm-slider" className="text-gray-700 font-medium">
            テンポ: <span className="text-blue-600 font-bold">{bpm} BPM</span>
          </label>
        </div>
        
        <input
          id="bpm-slider"
          type="range"
          min="40"
          max="208"
          value={bpm}
          onChange={handleBpmChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>40</span>
          <span>208</span>
        </div>
      </div>
      
      <TimeSignatureSelector
        timeSignature={timeSignature}
        onChange={setTimeSignature}
      />
      
      <div className="flex gap-4 mt-6">
        <button
          onClick={togglePlay}
          className={`flex items-center justify-center px-6 py-3 rounded-lg ${
            isPlaying 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors shadow-md`}
        >
          {isPlaying ? (
            <>
              <Square className="w-5 h-5 mr-2" />
              停止
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              開始
            </>
          )}
        </button>
        
        <button
          onClick={handleTapTempo}
          className="flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors shadow-md"
        >
          <Clock className="w-5 h-5 mr-2" />
          タップテンポ
        </button>
      </div>
    </div>
  );
};

export default Metronome;