import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface AudioContextProviderProps {
  children: React.ReactNode;
}

interface AudioContextType {
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  inputStream: MediaStream | null;
  startAudio: () => Promise<void>;
  stopAudio: () => void;
  isAudioInitialized: boolean;
}

const AudioContext = createContext<AudioContextType>({
  audioContext: null,
  analyser: null,
  inputStream: null,
  startAudio: async () => {},
  stopAudio: () => {},
  isAudioInitialized: false
});

export const useAudioContext = () => useContext(AudioContext);

export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

const startAudio = async () => {
  try {
    console.log('[startAudio] 開始');
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    inputStreamRef.current = stream;

    const context = audioContext || new window.AudioContext();
    if (!audioContext) {
      setAudioContext(context);
    }

    // Create analyzer
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      setIsAudioInitialized(true);
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
};

  const stopAudio = () => {
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach(track => track.stop());
      inputStreamRef.current = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
      setAudioContext(null);
      setAnalyser(null);
      setIsAudioInitialized(false);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        audioContext,
        analyser,
        inputStream: inputStreamRef.current,
        startAudio,
        stopAudio,
        isAudioInitialized
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};