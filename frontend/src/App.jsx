import React, { useState } from 'react';
import RealTimeFeed from './components/RealTimeFeed';
import ImageUpload from './components/ImageUpload';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { BrainCircuit, Cpu, ShieldCheck, Github } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('realtime');

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl">
            <BrainCircuit className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold title-gradient">Sentient-AI</h1>
            <p className="text-xs text-white/40 font-mono">v1.0.4-PROD</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            API STATUS: ACTIVE
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            SECURED (JWT)
          </div>
          <a href="#" className="hover:text-white transition-colors">
            <Github size={20} />
          </a>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Real-time Feed */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('realtime')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'realtime' ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              Real-time Stream
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'upload' ? 'bg-primary text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              Image Analysis
            </button>
          </div>

          {activeTab === 'realtime' ? <RealTimeFeed /> : <ImageUpload />}
        </div>

        {/* Right Column - Analytics & Info */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <AnalyticsDashboard history={[]} />
          
          <div className="glass p-6 bg-gradient-to-br from-primary/20 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="text-primary" />
              <h3 className="font-bold">Model Architecture</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Powered by <strong>MobileNetV2</strong> with fine-tuned top layers for high-precision emotion classification.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Latency</span>
                <span className="text-primary">&lt; 100ms</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[85%]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-white/20 text-sm">
        Designed for Excellence • Sentient.ai System Operating Environment
      </footer>
    </div>
  );
}

export default App;
