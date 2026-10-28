import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DiceRoller from "@/components/DiceRoller";

const FIRST_DURATION = 30 * 60; // 30 minuti
const SECOND_DURATION = 5 * 60; // 5 minuti

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Home() {
  const [phase, setPhase] = useState("idle"); // idle | first | second | done
  const [remaining, setRemaining] = useState(FIRST_DURATION);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);
        osc.start(now + delay);
        osc.stop(now + delay + 0.26);
      });
    } catch (e) {
      /* audio non disponibile */
    }
  }, []);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev > 1) return prev - 1;
      // tempo scaduto
      playBeep();
      setPhase((currentPhase) => {
        if (currentPhase === "first") {
          setRunning(true);
          return "second";
        }
        setRunning(false);
        return "done";
      });
      return 0;
    });
  }, [playBeep]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [running, tick]);

  // quando la fase cambia, imposta il tempo rimanente corretto
  useEffect(() => {
    if (phase === "first") setRemaining(FIRST_DURATION);
    else if (phase === "second") setRemaining(SECOND_DURATION);
    else if (phase === "idle") setRemaining(FIRST_DURATION);
  }, [phase]);

  const handleStart = () => {
    if (phase === "idle" || phase === "done") {
      setPhase("first");
    }
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setPhase("idle");
    setRemaining(FIRST_DURATION);
  };

  const totalForPhase = phase === "second" ? SECOND_DURATION : FIRST_DURATION;
  const progress = totalForPhase > 0 ? ((totalForPhase - remaining) / totalForPhase) * 100 : 0;

  const phaseLabel =
    phase === "idle" ? "Pronto" : phase === "first" ? "Timer 1 — 30 minuti" : phase === "second" ? "Timer 2 — 5 minuti" : "Completato";

  const ringColor = phase === "second" ? "stroke-rose-500" : "stroke-slate-900";
  const accentText = phase === "second" ? "text-rose-600" : "text-slate-900";

  const R = 130;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white mb-3">
            <TimerIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Timer Sequenziali</h1>
          <p className="text-sm text-slate-500 mt-1">30 minuti, poi 5 minuti automatici</p>
        </header>

        <Card className="p-8 shadow-sm border-slate-200">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${phase === "second" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
              <Bell className="w-3 h-3" />
              {phaseLabel}
            </span>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
              <circle cx="150" cy="150" r={R} className="stroke-slate-200" strokeWidth="14" fill="none" />
              <circle
                cx="150"
                cy="150"
                r={R}
                className={ringColor}
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC - (progress / 100) * CIRC}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold tabular-nums tracking-tight ${accentText}`}>{formatTime(remaining)}</span>
              <span className="text-xs uppercase tracking-widest text-slate-400 mt-2">minuti : secondi</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            {!running ? (
              <Button onClick={handleStart} size="lg" className="rounded-full px-8">
                <Play className="w-4 h-4 mr-2" />
                {phase === "idle" ? "Avvia" : phase === "done" ? "Ricomincia" : "Riprendi"}
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="outline" className="rounded-full px-8">
                <Pause className="w-4 h-4 mr-2" />
                Pausa
              </Button>
            )}
            <Button onClick={handleReset} size="lg" variant="ghost" className="rounded-full px-6">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className={`rounded-xl border p-4 text-center transition-colors ${phase === "first" ? "border-slate-900 bg-white" : "border-slate-200 bg-white/60"}`}>
            <div className="text-xs text-slate-500 mb-1">Timer 1</div>
            <div className="text-lg font-semibold text-slate-900">30:00</div>
            <div className={`text-xs mt-1 ${phase === "first" ? (running ? "text-emerald-600" : "text-amber-600") : "text-slate-400"}`}>
              {phase === "first" ? (running ? "In corso" : "In pausa") : phase === "second" || phase === "done" ? "Completato" : "In attesa"}
            </div>
          </div>
          <div className={`rounded-xl border p-4 text-center transition-colors ${phase === "second" ? "border-rose-500 bg-white" : "border-slate-200 bg-white/60"}`}>
            <div className="text-xs text-slate-500 mb-1">Timer 2</div>
            <div className="text-lg font-semibold text-slate-900">5:00</div>
            <div className={`text-xs mt-1 ${phase === "second" ? (running ? "text-emerald-600" : "text-amber-600") : phase === "done" ? "text-slate-500" : "text-slate-400"}`}>
              {phase === "second" ? (running ? "In corso" : "In pausa") : phase === "done" ? "Completato" : "In attesa"}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <DiceRoller />
        </div>
      </div>
    </div>
  );
}