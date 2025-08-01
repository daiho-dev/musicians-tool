import { useState } from 'react';
import { AudioContextProvider } from './context/AudioContextProvider';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Tuner from './components/tuner/Tuner';
import Metronome from './components/metronome/Metronome';
import Recorder from './components/recorder/Recorder';
import Fretboard from './components/fretboard/Fretboard';
import PracticePlayer from './components/practicePlayer/PracticePlayer';
import { Music, Clock, Mic, Guitar, Music2 } from 'lucide-react';

type Tab = 'tuner' | 'metronome' | 'recorder' | 'fretboard' | 'practice';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tuner');

  const renderContent = () => {
    switch (activeTab) {
      case 'tuner':
        return <Tuner />;
      case 'metronome':
        return <Metronome />;
      case 'recorder':
        return <Recorder />;
      case 'fretboard':
        return <Fretboard />;
      case 'practice':
        return <PracticePlayer />;
      default:
        return <Tuner />;
    }
  };

  return (
    <AudioContextProvider>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        
        <main className="flex-grow flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-6 pt-16 pb-24">
          {renderContent()}
        </main>
        
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
          <div className="max-w-screen-xl mx-auto px-4">
            <ul className="flex justify-between">
              <li className="flex-1">
                <button
                  onClick={() => setActiveTab('tuner')}
                  className={`flex flex-col items-center justify-center w-full py-4 text-xs font-medium ${
                    activeTab === 'tuner' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <Music className="w-6 h-6 mb-1" />
                  <span>チューナー</span>
                </button>
              </li>
              <li className="flex-1">
                <button
                  onClick={() => setActiveTab('metronome')}
                  className={`flex flex-col items-center justify-center w-full py-4 text-xs font-medium ${
                    activeTab === 'metronome' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <Clock className="w-6 h-6 mb-1" />
                  <span>メトロノーム</span>
                </button>
              </li>
              <li className="flex-1">
                <button
                  onClick={() => setActiveTab('recorder')}
                  className={`flex flex-col items-center justify-center w-full py-4 text-xs font-medium ${
                    activeTab === 'recorder' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <Mic className="w-6 h-6 mb-1" />
                  <span>録音</span>
                </button>
              </li>
              <li className="flex-1">
                <button
                  onClick={() => setActiveTab('fretboard')}
                  className={`flex flex-col items-center justify-center w-full py-4 text-xs font-medium ${
                    activeTab === 'fretboard' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <Guitar className="w-6 h-6 mb-1" />
                  <span>指板</span>
                </button>
              </li>
              <li className="flex-1">
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`flex flex-col items-center justify-center w-full py-4 text-xs font-medium ${
                    activeTab === 'practice' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
                  }`}
                >
                  <Music2 className="w-6 h-6 mb-1" />
                  <span>練習</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
        
        <Footer />
      </div>
    </AudioContextProvider>
  );
}

export default App;