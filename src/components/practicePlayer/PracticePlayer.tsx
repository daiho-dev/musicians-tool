import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCcw } from 'lucide-react';
import SpeedControls from './SpeedControls';

const PracticePlayer: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  // Format time in mm:ss format
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      const fileUrl = URL.createObjectURL(file);
      
      // Clean up previous audio resources
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioFile(file);
      setAudioUrl(fileUrl);
    }
  };
  
  // Initialize audio context and connect nodes
  const setupAudio = () => {
    if (audioRef.current && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceNodeRef.current.connect(audioContextRef.current.destination);
    }
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setupAudio(); // Ensure audio context is set up
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Update playback rate
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };
  
  // Update progress bar and current time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Seek to position on progress bar click
  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const progressBar = event.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = (event.clientX - rect.left) / rect.width;
      const seekTime = clickPosition * duration;
      
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };
  
  // Reset player to beginning
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  // Toggle loop
  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };
  
  // Set up audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    
    if (audio) {
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.onended = () => {
        if (!audio.loop) {
          setIsPlaying(false);
        }
      };
    }
    
    return () => {
      // Clean up
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  return (
    <div className="flex flex-col items-center justify-start max-w-screen-md mx-auto w-full py-4 pt-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Practice Tool</h2>
        <p className="text-gray-600">Upload audio and adjust playback speed</p>
      </div>
      
      {/* Audio element */}
      <audio 
        ref={audioRef} 
        src={audioUrl || undefined} 
        onTimeUpdate={handleTimeUpdate}
        loop={isLooping}
      />
      
      {/* File upload area */}
      {!audioFile && (
        <div className="w-full bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 mb-6 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-4">Upload MP3 or WAV file</p>
          <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
            Choose File
            <input 
              type="file" 
              accept=".mp3,.wav" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>
      )}
      
      {/* Player controls */}
      {audioFile && (
        <div className="w-full bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="mb-4 text-center">
            <p className="font-medium text-gray-800 truncate">{audioFile.name}</p>
          </div>
          
          {/* Progress bar */}
          <div 
            className="w-full h-3 bg-gray-200 rounded-full mb-2 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          
          {/* Time display */}
          <div className="flex justify-between text-xs text-gray-600 mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          {/* Primary controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </button>
            
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-full transition-colors ${
                isLooping 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 2L21 6L17 10" />
                <path d="M3 11V9C3 7.89543 3.89543 7 5 7H21" />
                <path d="M7 22L3 18L7 14" />
                <path d="M21 13V15C21 16.1046 20.1046 17 19 17H3" />
              </svg>
            </button>
          </div>
          
          {/* Speed controls */}
          <SpeedControls 
            playbackRate={playbackRate} 
            onRateChange={handleRateChange} 
          />
          
          {/* File upload button for changing file */}
          <div className="mt-6 text-center">
            <label className="inline-block px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded cursor-pointer hover:bg-gray-300 transition-colors">
              Change File
              <input 
                type="file" 
                accept=".mp3,.wav" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
        <h3 className="font-medium mb-2">Features:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Upload MP3 or WAV files</li>
          <li>Adjust playback speed from 0.5x to 2.0x</li>
          <li>Loop sections for repeated practice</li>
          <li>Pitch is maintained when changing speed</li>
          <li>Reset to beginning with one click</li>
        </ul>
      </div>
    </div>
  );
};

export default PracticePlayer;