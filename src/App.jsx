import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  BarChart3, 
  History, 
  Zap, 
  Sun, 
  Moon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { fifo, lru, optimal } from './utils/algorithms';

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [refStringInput, setRefStringInput] = useState('7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1');
  const [frameCount, setFrameCount] = useState(3);
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [speed, setSpeed] = useState(1000); // ms
  
  const [simulationData, setSimulationData] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  
  const timerRef = useRef(null);

  useEffect(() => {
    runComparison();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const runComparison = () => {
    const refs = refStringInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (refs.length === 0) return;

    const resFifo = fifo(refs, frameCount);
    const resLru = lru(refs, frameCount);
    const resOpt = optimal(refs, frameCount);

    const comp = [
      { name: 'FIFO', faults: resFifo.totalFaults, color: '#3b82f6' },
      { name: 'LRU', faults: resLru.totalFaults, color: '#10b981' },
      { name: 'Optimal', faults: resOpt.totalFaults, color: '#f59e0b' }
    ];
    setComparisonData(comp);

    const currentRes = algorithm === 'FIFO' ? resFifo : algorithm === 'LRU' ? resLru : resOpt;
    setSimulationData(currentRes);
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const handleRun = () => {
    runComparison();
  };

  const handleRandom = () => {
    const len = 15 + Math.floor(Math.random() * 10);
    const rand = Array.from({ length: len }, () => Math.floor(Math.random() * 8)).join(',');
    setRefStringInput(rand);
  };

  useEffect(() => {
    if (isPlaying && simulationData && currentStep < simulationData.steps.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= (simulationData?.steps.length || 0) - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStep, simulationData, speed]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const resetSimulation = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const stepForward = () => {
    if (simulationData && currentStep < simulationData.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep >= 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = simulationData?.steps[currentStep] || {
    frames: new Array(frameCount).fill(null),
    isFault: false,
    replacedIndex: null,
    faultsCount: 0,
    hitsCount: 0,
    request: null
  };

  const bestAlgo = [...comparisonData].sort((a, b) => a.faults - b.faults)[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              Page Replacement Visualizer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Simulate OS Memory Management Algorithms visually
            </p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-lg hover:ring-2 ring-blue-500 transition-all border border-slate-200 dark:border-slate-800"
          >
            {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-slate-700" />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Reference String</label>
                  <input 
                    type="text" 
                    value={refStringInput}
                    onChange={(e) => setRefStringInput(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-blue-500 outline-none transition-all"
                    placeholder="e.g. 7,0,1,2,0,3,0,4"
                  />
                  <div className="flex justify-between">
                    <button onClick={handleRandom} className="text-xs text-blue-500 hover:underline">Generate Random</button>
                    <span className="text-xs text-slate-400">Comma separated numbers</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Memory Frames</label>
                    <input 
                      type="number" 
                      min="1" max="8"
                      value={frameCount}
                      onChange={(e) => setFrameCount(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Algorithm</label>
                    <select 
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-blue-500 outline-none transition-all"
                    >
                      <option value="FIFO">FIFO</option>
                      <option value="LRU">LRU</option>
                      <option value="Optimal">Optimal</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleRun}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Update Simulation
                </button>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Step Controls</h2>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex justify-center items-center gap-4">
                  <button 
                    onClick={stepBackward}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={togglePlay}
                    className="p-5 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                  <button 
                    onClick={stepForward}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={resetSimulation}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-blue-500 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <span>Speed Control</span>
                    <span className="text-blue-500">{(2100 - speed) / 200}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" max="2000" step="100"
                    value={speed}
                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Visualizer & Stats */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              
              {/* Reference Timeline */}
              <div className="mb-12 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <div className="flex gap-2 items-center min-w-max px-2">
                  <span className="text-xs font-bold text-slate-400 mr-2 uppercase">Input Stream</span>
                  {simulationData?.steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={false}
                      animate={{ 
                        scale: currentStep === idx ? 1.2 : 1,
                        backgroundColor: currentStep === idx ? (step.isFault ? '#ef4444' : '#10b981') : (darkMode ? '#1e293b' : '#f1f5f9'),
                        color: currentStep === idx ? 'white' : 'inherit',
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg font-bold shadow-sm cursor-pointer`}
                      onClick={() => setCurrentStep(idx)}
                    >
                      {step.request}
                    </motion.div>
                  )) || <div className="text-slate-400 italic text-sm">Waiting for simulation...</div>}
                </div>
              </div>

              {/* Memory Frames Grid */}
              <div className="flex flex-col items-center gap-12 py-8">
                <div className="relative group">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentStep}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex gap-4 md:gap-6"
                    >
                      {currentStepData.frames.map((frame, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ 
                            scale: currentStepData.replacedIndex === idx ? [1, 1.1, 1] : 1,
                            borderColor: currentStepData.replacedIndex === idx ? '#3b82f6' : 'transparent',
                          }}
                          transition={{ duration: 0.3 }}
                          className={`w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center rounded-2xl shadow-lg border-2 dark:bg-slate-800 bg-slate-100 text-2xl font-bold transition-all
                            ${currentStepData.replacedIndex === idx ? 'ring-4 ring-blue-500/20' : ''}`}
                        >
                          <span className="text-[10px] text-slate-400 absolute top-2 font-normal">F{idx+1}</span>
                          {frame !== null ? frame : '-'}
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-center gap-4">
                  <AnimatePresence mode="wait">
                    {currentStep >= 0 && (
                      <motion.div
                        key={currentStep + (currentStepData.isFault ? 'f' : 'h')}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className={`px-8 py-3 rounded-full text-xl font-black uppercase tracking-widest shadow-lg ${
                          currentStepData.isFault ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {currentStepData.isFault ? 'Page Fault' : 'Page Hit'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="flex gap-8 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="font-semibold">Faults: {currentStepData.faultsCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-semibold">Hits: {currentStepData.hitsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Statistics & Charts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-semibold">Algorithm Comparison</h2>
                  </div>
                  {bestAlgo && (
                    <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Best: {bestAlgo.name}
                    </div>
                  )}
                </div>
                
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        cursor={{ fill: darkMode ? '#1e293b' : '#f1f5f9' }}
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          borderColor: darkMode ? '#334155' : '#e2e8f0',
                          borderRadius: '12px',
                          color: darkMode ? '#f8fafc' : '#0f172a'
                        }}
                      />
                      <Bar dataKey="faults" radius={[8, 8, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-semibold">Faults Trend</h2>
                </div>
                
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulationData?.steps || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="stepIndex" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Step', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          borderColor: darkMode ? '#334155' : '#e2e8f0',
                          borderRadius: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="faultsCount" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        dot={false}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        {/* Help Info Footer */}
        <footer className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-blue-500 p-2 rounded-lg text-white">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-300">How it works</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              The reference string represents a sequence of page requests. When a page is requested that isn't in memory (frames), a <span className="font-bold underline">page fault</span> occurs and a replacement must happen. Optimal replacement replaces the page that won't be used for the longest time.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
