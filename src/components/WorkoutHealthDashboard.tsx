import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Wind,
  Apple,
  Activity,
  Zap,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { HEALTH_TIPS, WORKOUT_MOTIVATIONS, HealthTip } from '../data/healthTips';

interface WorkoutHealthDashboardProps {
  isMonitoring: boolean;
  onOpenSettings: () => void;
  wakeLockActive: boolean;
  onManualSnap?: () => void;
}

export const WorkoutHealthDashboard: React.FC<WorkoutHealthDashboardProps> = ({
  isMonitoring,
  onOpenSettings,
  wakeLockActive,
}) => {
  // --- Workout Stopwatch ---
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setWorkoutSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatStopwatch = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calories estimation (~ 7.2 kcal / min during workout)
  const caloriesBurned = Math.round((workoutSeconds / 60) * 7.2);

  // --- Health Tips Rotation ---
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [motivationIndex, setMotivationIndex] = useState(0);

  // Filter tips
  const filteredTips = selectedCategory === 'all'
    ? HEALTH_TIPS
    : HEALTH_TIPS.filter((t) => t.category === selectedCategory);

  const activeTip: HealthTip = filteredTips[currentTipIndex % filteredTips.length] || HEALTH_TIPS[0];

  // Auto rotate tips every 14 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % filteredTips.length);
      setMotivationIndex((prev) => (prev + 1) % WORKOUT_MOTIVATIONS.length);
    }, 14000);
    return () => clearInterval(timer);
  }, [filteredTips.length]);

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % filteredTips.length);
  };

  const handlePrevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
  };

  // --- Water Hydration Tracker ---
  const [waterGlasses, setWaterGlasses] = useState(3);
  const totalWaterTarget = 8;

  // --- Rest Interval Counter ---
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);

  useEffect(() => {
    let restInt: number | null = null;
    if (restRunning && restSeconds !== null && restSeconds > 0) {
      restInt = window.setInterval(() => {
        setRestSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setRestRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInt) clearInterval(restInt);
    };
  }, [restRunning, restSeconds]);

  const startRestTimer = (secs: number) => {
    setRestSeconds(secs);
    setRestRunning(true);
  };

  // Category Icon Resolver
  const renderTipIcon = (category: string) => {
    switch (category) {
      case 'hydration': return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'workout': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'breathing': return <Wind className="w-5 h-5 text-emerald-400" />;
      case 'nutrition': return <Apple className="w-5 h-5 text-rose-400" />;
      case 'recovery': return <Moon className="w-5 h-5 text-indigo-400" />;
      default: return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-2 pb-12">
      {/* Hero Stats Row: Workout Stopwatch & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Workout Stopwatch */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span>ওয়ার্কআউট সময় (Session)</span>
            </div>
            {wakeLockActive && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Screen Awake
              </span>
            )}
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
              {formatStopwatch(workoutSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isTimerRunning
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950'
              }`}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isTimerRunning ? 'পজ করুন' : 'চালু করুন'}
            </button>
            <button
              onClick={() => {
                setWorkoutSeconds(0);
                setIsTimerRunning(true);
              }}
              title="রিসেট"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Energy Burned */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>আনুমানিক ক্যালোরি বার্ন</span>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Active Burn
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
              {caloriesBurned}
            </span>
            <span className="text-sm font-semibold text-slate-400">kcal</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>স্বাভাবিক হৃদস্পন্দন ও ব্যায়াম গতি বজায় রাখুন</span>
          </div>
        </div>

        {/* Water Hydration Counter */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>পানি পান ট্র্যাকার (Hydration)</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {waterGlasses} / {totalWaterTarget} গ্লাস
            </span>
          </div>
          <div className="my-3 flex items-center gap-1.5">
            {Array.from({ length: totalWaterTarget }).map((_, idx) => (
              <div
                key={idx}
                className={`h-7 flex-1 rounded-md transition-all ${
                  idx < waterGlasses
                    ? 'bg-cyan-500 shadow-sm shadow-cyan-500/40'
                    : 'bg-slate-800 border border-slate-700/50'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setWaterGlasses((prev) => Math.min(totalWaterTarget, prev + 1))}
            className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>১ গ্লাস পানি পান করলাম</span>
          </button>
        </div>
      </div>

      {/* MAIN HERO: GOLDEN HEALTH & FITNESS TIPS CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                ব্যায়াম ও স্বাস্থ্য টিপস
                <span className="text-xs font-normal text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Daily Golden Tip
                </span>
              </h2>
              <p className="text-xs text-slate-400">ব্যায়ামের সঠিক কার্যকারিতা ও স্বাস্থ্য সুরক্ষার বিজ্ঞানসম্মত পরামর্শ</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrevTip}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="পূর্ববর্তী টিপস"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-2">
              {((currentTipIndex % filteredTips.length) + 1)} / {filteredTips.length}
            </span>
            <button
              onClick={handleNextTip}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="পরবর্তী টিপস"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
          {[
            { id: 'all', label: 'সব টিপস' },
            { id: 'workout', label: '🏋️‍♂️ ব্যায়াম ও পোসচার' },
            { id: 'hydration', label: '💧 পানি ও হাইড্রেশন' },
            { id: 'breathing', label: '🫁 সঠিক শ্বাসপ্রশ্বাস' },
            { id: 'recovery', label: '⏱️ বিশ্রাম ও রিকভারি' },
            { id: 'nutrition', label: '🥗 পোস্ট-ওয়ার্কআউট পুষ্টি' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentTipIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Tip Display Card */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/70 flex items-center justify-center">
              {renderTipIcon(activeTip.category)}
            </div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              {activeTip.categoryLabel}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white leading-snug">
            {activeTip.title}
          </h3>

          <p className="text-slate-300 text-sm leading-relaxed">
            {activeTip.description}
          </p>

          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-emerald-300">মূল করণীয়: </strong>
              <span>{activeTip.keyAction}</span>
            </div>
          </div>

          {activeTip.quote && (
            <div className="text-xs italic text-slate-400 border-l-2 border-slate-700 pl-3">
              "{activeTip.quote}"
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Quick Rest Interval Timer & Daily Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Set Rest Timer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">সেট রেস্ট টাইমার (Rest Timer)</h4>
            </div>
            {restSeconds !== null && (
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {restSeconds}s বাকি
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">সেট শেষ করার পর পরিমিত সময়ের বোতামে চাপ দিয়ে দ্রুত বিশ্রাম নিন:</p>

          <div className="grid grid-cols-4 gap-2">
            {[30, 45, 60, 90].map((sec) => (
              <button
                key={sec}
                onClick={() => startRestTimer(sec)}
                className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  restSeconds === sec && restRunning
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950 font-extrabold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* Workout Routine Checklist */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-white">দৈনিক ওয়ার্কআউট চেকলিস্ট</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-0" />
              <span>৫ মিনিট ওয়ার্ম-আপ ও জয়েন্ট রোটেশন</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-0" />
              <span>সঠিক পোসচারে মূল ব্যায়াম / সেট সম্পন্নকরণ</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-0" />
              <span>ব্যায়ামের মাঝে নিয়মিত পানি পান</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700 focus:ring-0" />
              <span>সেশন শেষে ৫ মিনিট ফুল-বডি স্ট্রেচিং ও কুল-ডাউন</span>
            </label>
          </div>
        </div>
      </div>

      {/* Discreet Footer Note with secret settings access */}
      <div className="pt-2 pb-4 flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Healthy v2.4 • Daily Workout Tracker</span>
        <button
          onClick={onOpenSettings}
          className="text-slate-600 hover:text-slate-400 transition-colors p-1"
          title="Device Info & Config"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};
