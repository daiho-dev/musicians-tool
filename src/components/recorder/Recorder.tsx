import React, { useState, useRef, useEffect } from 'react';
import { useAudioContext } from '../../context/AudioContextProvider';
import { Mic, Square, Play, Pause, Save, Trash2 } from 'lucide-react';
import WaveformDisplay from './WaveformDisplay';

type RecordingState = 'inactive' | 'recording' | 'paused' | 'stopped';

const Recorder: React.FC = () => {
  const { startAudio, isAudioInitialized } = useAudioContext();
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Format recording time as mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.warn('audio/webm not supported, falling back to default');
      }
      
      // Create MediaRecorder with appropriate options
      const options = MediaRecorder.isTypeSupported('audio/webm') 
        ? { mimeType: 'audio/webm' }
        : {};
      
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data available:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('Recording stopped, chunks:', audioChunksRef.current.length);
        if (audioChunksRef.current.length > 0) {
          const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          setAudioBlob(audioBlob);
          console.log('Audio blob created:', audioBlob.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('録音中にエラーが発生しました');
        setRecordingState('inactive');
      };
      
      mediaRecorderRef.current.onstart = () => {
        console.log('Recording started');
        setRecordingState('recording');
        
        // Start timer
        timerIntervalRef.current = window.setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      };
      
      // Start recording with timeslice for regular data events
      mediaRecorderRef.current.start(100); // Request data every 100ms
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('マイクのアクセスが許可されていない可能性があります。ブラウザ設定をご確認ください。');
      setRecordingState('inactive');
    }
  };
  
  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      
      // Pause timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };
  
  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      
      // Resume timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      
      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      
      setRecordingState('stopped');
      
      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };
  
  // Reset recording
  const resetRecording = () => {
    // Clean up previous audio URL
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    setRecordingState('inactive');
    setRecordingTime(0);
    setAudioURL(null);
    setAudioBlob(null);
    setError(null);
    audioChunksRef.current = [];
    
    // Stop any playing audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };
  
  // Save recording
  const saveRecording = () => {
    if (audioBlob) {
      const fileName = `recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      const url = URL.createObjectURL(audioBlob);
      
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-screen-md mx-auto py-4 pt-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">音声録音</h2>
        <p className="text-gray-600">録音、再生、保存ができます</p>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="w-full bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="text-center mb-2">
          <div className={`text-2xl font-mono ${
            recordingState === 'recording' ? 'text-red-500' : 'text-gray-800'
          }`}>
            {formatTime(recordingTime)}
          </div>
          
          {recordingState === 'recording' && (
            <div className="flex items-center justify-center mt-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-red-500 text-sm">録音中</span>
            </div>
          )}
          
          {recordingState === 'paused' && (
            <div className="flex items-center justify-center mt-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-yellow-600 text-sm">一時停止中</span>
            </div>
          )}
        </div>
        
        <WaveformDisplay 
          audioURL={audioURL} 
          isRecording={recordingState === 'recording'} 
          ref={audioElementRef}
        />
      </div>
      
      <div className="w-full flex flex-wrap justify-center gap-3">
        {recordingState === 'inactive' && (
          <button
            onClick={startRecording}
            className="flex items-center justify-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
          >
            <Mic className="w-5 h-5 mr-2" />
            録音開始
          </button>
        )}
        
        {recordingState === 'recording' && (
          <>
            <button
              onClick={pauseRecording}
              className="flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors shadow-md"
            >
              <Pause className="w-5 h-5 mr-2" />
              一時停止
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
            >
              <Square className="w-5 h-5 mr-2" />
              停止
            </button>
          </>
        )}
        
        {recordingState === 'paused' && (
          <>
            <button
              onClick={resumeRecording}
              className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md"
            >
              <Play className="w-5 h-5 mr-2" />
              再開
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
            >
              <Square className="w-5 h-5 mr-2" />
              停止
            </button>
          </>
        )}
        
        {recordingState === 'stopped' && (
          <>
            <button
              onClick={saveRecording}
              className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md"
            >
              <Save className="w-5 h-5 mr-2" />
              保存
            </button>
            
            <button
              onClick={resetRecording}
              className="flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-md"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              削除
            </button>
          </>
        )}
      </div>
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-full mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p>状態: {recordingState}</p>
          <p>チャンク数: {audioChunksRef.current.length}</p>
          {audioBlob && <p>ファイルサイズ: {audioBlob.size} bytes</p>}
        </div>
      )}
    </div>
  );
};

export default Recorder;