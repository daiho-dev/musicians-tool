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
  audioError: string | null;
}

const AudioContext = createContext<AudioContextType>({
  audioContext: null,
  analyser: null,
  inputStream: null,
  startAudio: async () => {},
  stopAudio: () => {},
  isAudioInitialized: false,
  audioError: null
});

export const useAudioContext = () => useContext(AudioContext);

export const AudioContextProvider: React.FC<AudioContextProviderProps> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

const startAudio = async () => {
  try {
    console.log('[startAudio] 開始');
    setAudioError(null); // Clear any previous errors
    
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
    setIsAudioInitialized(false);
    
    // Handle specific error types with user-friendly messages
    if (error instanceof Error) {
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setAudioError('マイクが見つかりません。マイクが接続されているか確認してください。');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setAudioError('マイクへのアクセスが拒否されました。ブラウザの設定でマイクの使用を許可してください。');
      } else if (error.name === 'NotSupportedError') {
        setAudioError('お使いのブラウザはマイク機能をサポートしていません。');
      } else {
        setAudioError('オーディオの初期化中にエラーが発生しました。ページを再読み込みして再試行してください。');
      }
    } else {
      setAudioError('不明なエラーが発生しました。');
    }
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
    
    setAudioError(null); // Clear error when stopping audio
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
        isAudioInitialized,
        audioError
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};