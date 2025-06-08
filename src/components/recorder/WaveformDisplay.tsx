import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';

interface WaveformDisplayProps {
  audioURL: string | null;
  isRecording: boolean;
}

const WaveformDisplay = forwardRef<HTMLAudioElement, WaveformDisplayProps>(
  ({ audioURL, isRecording }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    
    useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);
    
    // Initialize wavesurfer
    useEffect(() => {
      if (containerRef.current && !wavesurferRef.current) {
        wavesurferRef.current = WaveSurfer.create({
          container: containerRef.current,
          waveColor: '#6366f1',
          progressColor: '#4f46e5',
          cursorColor: '#f43f5e',
          cursorWidth: 2,
          height: 80,
          barWidth: 2,
          barGap: 1,
          barRadius: 2
        });
        
        wavesurferRef.current.on('play', () => setIsPlaying(true));
        wavesurferRef.current.on('pause', () => setIsPlaying(false));
        wavesurferRef.current.on('finish', () => setIsPlaying(false));
      }
      
      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = null;
        }
      };
    }, []);
    
    // Load audio when URL changes
    useEffect(() => {
      if (audioURL && wavesurferRef.current) {
        wavesurferRef.current.load(audioURL);
      }
    }, [audioURL]);
    
    // Toggle play/pause
    const togglePlayPause = () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.playPause();
      }
    };
    
    return (
      <div>
        {/* Waveform display */}
        <div 
          ref={containerRef} 
          className={`w-full h-20 rounded-lg border-2 ${
            isRecording 
              ? 'border-red-200 bg-red-50 animate-pulse' 
              : audioURL 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-200 bg-gray-50'
          }`}
        >
          {!audioURL && !isRecording && (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p className="text-sm">No recording available</p>
            </div>
          )}
          
          {isRecording && (
            <div className="h-full flex items-center justify-center">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-red-400 rounded-full"
                    style={{
                      height: `${20 + Math.random() * 40}px`,
                      animationDelay: `${i * 0.1}s`,
                      animation: 'soundwave 0.5s infinite alternate'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Audio controls */}
        {audioURL && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
        )}
        
        {/* Hidden audio element for ref access */}
        <audio ref={audioRef} src={audioURL || undefined} className="hidden" />
      </div>
    );
  }
);

export default WaveformDisplay;