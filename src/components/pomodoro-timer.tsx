"use client";

import { useEffect, useState } from "react";

type Mode = "focus" | "short" | "long";
const durations: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

function clock(seconds: number) {
  return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [remaining, setRemaining] = useState(durations.focus);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, mode]);

  useEffect(() => {\n    if (remaining === 0 && running) {\n      setRunning(false);\n      if (mode === "focus") setSessions((count) => count + 1);\n    }\n  }, [remaining, running, mode]);\n\n  const chooseMode = (next: Mode) => {
    setRunning(false);
    setMode(next);
    setRemaining(durations[next]);
  };
  const progress = ((durations[mode] - remaining) / durations[mode]) * 100;

  return (
    <section aria-label="Pomodoro focus timer" className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Timer mode">
        {(["focus", "short", "long"] as Mode[]).map((item) => (
          <button key={item} type="button" onClick={() => chooseMode(item)} aria-pressed={mode === item}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${mode === item ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-800 hover:bg-violet-100"}`}>
            {item === "focus" ? "Focus" : item === "short" ? "Short break" : "Long break"}
          </button>
        ))}
      </div>
      <div className="mx-auto my-8 flex h-56 w-56 items-center justify-center rounded-full border-[10px] border-violet-100"
        style={{ background: `conic-gradient(#7657ff ${progress}%, #eeeaff ${progress}%)` }}>
        <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-white">
          <output aria-live="off" className="text-5xl font-bold tabular-nums text-slate-900">{clock(remaining)}</output>
          <span className="mt-2 text-sm font-medium text-slate-500">{mode === "focus" ? "Time to focus" : "Take a breather"}</span>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={() => setRunning((value) => !value)}
          className="rounded-xl bg-violet-600 px-7 py-3 font-semibold text-white hover:bg-violet-700">
          {running ? "Pause" : remaining === 0 ? "Start again" : "Start"}
        </button>
        <button type="button" onClick={() => { setRunning(false); setRemaining(durations[mode]); }}
          className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Reset</button>
      </div>
      <p className="mt-5 text-center text-sm text-slate-600">Completed focus sessions: <strong>{sessions}</strong></p>
      {remaining === 0 && <p role="status" className="mt-3 text-center font-semibold text-violet-700">{mode === "focus" ? "Focus session complete. Take a break!" : "Break complete. Ready for another focus session?"}</p>}
      <p className="mt-4 text-center text-xs text-slate-500">25-minute focus · 5-minute short break · 15-minute long break. Timer runs in this browser tab.</p>
    </section>
  );
}
