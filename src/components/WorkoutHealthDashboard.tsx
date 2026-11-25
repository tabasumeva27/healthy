import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Timer,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { HEALTH_TIPS, WORKOUT_MOTIVATIONS, HealthTip } from '../data/healthTips';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'warmup', label: '৫ মিনিট ওয়ার্ম-আপ ও জয়েন্ট রোটেশন', checked: true },
  { id: 'form', label: 'সঠিক পোসচারে মূল ব্যায়াম / সেট সম্পন্নকরণ', checked: true },
  { id: 'hydrate', label: 'ব্যায়ামের মাঝে নিয়মিত পানি পান', checked: true },
  { id: 'cooldown', label: 'সেশন শেষে ৫ মিনিট ফুল-বডি স্ট্রেচিং ও কুল-ডাউন', checked: false },
];

export const WorkoutHealthDashboard: React.FC = () => {
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

  const filteredTips = selectedCategory === 'all'
    ? HEALTH_TIPS
    : HEALTH_TIPS.filter((t) => t.category === selectedCategory);

  const safeTipIdx = currentTipIndex % filteredTips.length;
  const activeTip: HealthTip = filteredTips[safeTipIdx] || HEALTH_TIPS[0];

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
  const [restTotal, setRestTotal] = useState<number>(60);
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
    setRestTotal(secs);
    setRestSeconds(secs);
    setRestRunning(true);
  };

  // --- Daily Checklist State ---
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const completedCount = checklist.filter((i) => i.checked).length;

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const categories = [
    { id: 'all', label: 'সব টিপস' },
    { id: 'workout', label: 'ব্যায়াম ও পোসচার' },
    { id: 'hydration', label: 'পানি ও হাইড্রেশন' },
    { id: 'breathing', label: 'শ্বাসপ্রশ্বাস' },
    { id: 'recovery', label: 'বিশ্রাম ও রিকভারি' },
    { id: 'nutrition', label: 'পুষ্টি' },
  ];

  const restProgressPct =
    restSeconds !== null && restTotal > 0
      ? Math.max(0, Math.min(100, (restSeconds / restTotal) * 100))
      : 0;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 py-2 pb-10">
      {/* Intro Motivation Header Line */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-medium text-emerald-400 tracking-wide">
            দৈনিক ওয়ার্কআউট সঙ্গী · সক্রিয় সেশন
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 text-balance">
            {WORKOUT_MOTIVATIONS[motivationIndex]}
          </h1>
        </div>
        <div className="text-xs text-slate-400 tabular-nums whitespace-nowrap shrink-0">
          দৈনিক লক্ষ্য: {completedCount} / {checklist.length} সম্পন্ন
        </div>
      </div>

      {/* Unified 3-Column Architectural Metrics Strip */}
      <section
        aria-label="Workout session metrics"
        className="bg-[#10141B] border border-white/[0.08] rounded-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]"
      >
        {/* 1. Workout Stopwatch */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span>ওয়ার্কআউট সময়</span>
            </span>
            <span className="text-slate-500">
              {isTimerRunning ? 'চলমান' : 'বিরতি'}
            </span>
          </div>

          <div className="font-mono text-4xl sm:text-[42px] font-bold tracking-tight text-white tabular-nums leading-none">
            {formatStopwatch(workoutSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex-1 h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 ${
                isTimerRunning
                  ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
              }`}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isTimerRunning ? 'বিরতি দিন' : 'চালু করুন'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWorkoutSeconds(0);
                setIsTimerRunning(true);
              }}
              title="সময় রিসেট করুন"
              aria-label="সময় রিসেট করুন"
              className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Calories Burned */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>ক্যালোরি বার্ন</span>
            </span>
            <span className="text-slate-500 font-mono tabular-nums">~7.2 kcal/m</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-[42px] font-bold tracking-tight text-white tabular-nums leading-none">
              {caloriesBurned}
            </span>
            <span className="text-sm font-medium text-slate-400">kcal</span>
          </div>

          <div className="h-10 flex items-center text-xs text-slate-400">
            স্বাভাবিক হৃদস্পন্দন ও ছন্দময় ব্যায়াম গতি বজায় রাখুন
          </div>
        </div>

        {/* 3. Water Hydration Tracker */}
        <div className="p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>পানি পান ট্র্যাকার</span>
            </span>
            <span className="font-mono text-slate-300 tabular-nums">
              {waterGlasses} / {totalWaterTarget} গ্লাস
            </span>
          </div>

          {/* Interactive Hydration Segment Bars */}
          <div className="flex items-center gap-1.5" role="group" aria-label="পানির গ্লাস নির্বাচন">
            {Array.from({ length: totalWaterTarget }).map((_, idx) => {
              const filled = idx < waterGlasses;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setWaterGlasses(idx + 1 === waterGlasses ? idx : idx + 1)}
                  title={`${idx + 1} গ্লাস`}
                  aria-label={`${idx + 1} গ্লাস পানি`}
                  className={`h-9 flex-1 rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    filled
                      ? 'bg-sky-500/85 hover:bg-sky-400'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06]'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
              disabled={waterGlasses === 0}
              aria-label="১ গ্লাস কমান"
              className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] disabled:opacity-35 text-slate-300 border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setWaterGlasses((prev) => Math.min(totalWaterTarget, prev + 1))}
              disabled={waterGlasses >= totalWaterTarget}
              className="flex-1 h-10 px-4 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.11] disabled:opacity-45 text-slate-100 border border-white/[0.08] flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>১ গ্লাস যোগ করুন</span>
            </button>
          </div>
        </div>
      </section>

      {/* Primary Focal Anchor: Health & Coaching Guide */}
      <section
        aria-label="ব্যায়াম ও স্বাস্থ্য নির্দেশিকা"
        className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{activeTip.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {String(safeTipIdx + 1).padStart(2, '0')} / {String(filteredTips.length).padStart(2, '0')}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-1">
              ব্যায়াম ও স্বাস্থ্য নির্দেশিকা
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrevTip}
              aria-label="পূর্ববর্তী পরামর্শ"
              className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextTip}
              aria-label="পরবর্তী পরামর্শ"
              className="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/[0.08] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentTipIndex(0);
                }}
                className={`h-9 px-3.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 ${
                  active
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Editorial Tip Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug text-balance">
              {activeTip.title}
            </h3>
            <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed">
              {activeTip.description}
            </p>
            {activeTip.quote && (
              <p className="text-xs italic text-slate-400 pt-2">
                “{activeTip.quote}”
              </p>
            )}
          </div>

          <div className="lg:col-span-5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>মূল করণীয়</span>
            </div>
            <p className="text-sm font-medium text-emerald-100 leading-relaxed">
              {activeTip.keyAction}
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Workspace Split: Rest Interval Timer & Daily Routine Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Set Rest Timer */}
        <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>সেট রেস্ট টাইমার</span>
              </h4>
              <span className="font-mono text-sm font-semibold text-amber-400 tabular-nums">
                {restSeconds !== null ? `${restSeconds}s` : 'প্রস্তুত'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              সেট শেষ করার পর বিশ্রামের সময় নির্বাচন করুন:
            </p>
          </div>

          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${restSeconds !== null ? restProgressPct : 0}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[30, 45, 60, 90].map((sec) => {
              const isSelected = restTotal === sec && restSeconds !== null && restSeconds > 0;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => startRestTimer(sec)}
                  className={`h-11 rounded-xl text-xs font-mono font-semibold tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] text-slate-200 border border-white/[0.08]'
                  }`}
                >
                  {sec}s
                </button>
              );
            })}
          </div>

          {restSeconds !== null && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRestRunning(!restRunning)}
                disabled={restSeconds === 0}
                className="flex-1 h-9 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-40 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                {restRunning ? 'বিরতি দিন' : 'চালু করুন'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRestRunning(false);
                  setRestSeconds(null);
                }}
                className="h-9 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                রিসেট
              </button>
            </div>
          )}
        </section>

        {/* Daily Workout Checklist */}
        <section className="bg-[#10141B] border border-white/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">দৈনিক ওয়ার্কআউট চেকলিস্ট</h4>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              {completedCount}/{checklist.length}
            </span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className="w-full py-3 flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 rounded"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    item.checked
                      ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : 'border-white/20 bg-white/[0.03] group-hover:border-white/40'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </span>
                <span
                  className={`text-xs sm:text-sm transition-colors ${
                    item.checked ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-white/[0.06]">
        <span>Healthy · Daily Workout & Hydration Companion</span>
        <span>Stay Consistent</span>
      </footer>
    </div>
  );
};
