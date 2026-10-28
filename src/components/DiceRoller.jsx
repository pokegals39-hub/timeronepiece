import React, { useState } from "react";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FACES = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

function rollOne() {
  return Math.floor(Math.random() * 6) + 1;
}

export default function DiceRoller() {
  const [count, setCount] = useState(2);
  const [values, setValues] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    let ticks = 0;
    const interval = setInterval(() => {
      setValues(Array.from({ length: count }, () => rollOne()));
      ticks++;
      if (ticks >= 10) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 80);
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <Card className="p-6 shadow-sm border-slate-200">
      <div className="flex items-center gap-2 mb-5">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-white">
          <Dices className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Lancio dei dadi</h2>
          <p className="text-xs text-slate-500">Scegli quanti dadi e lancia</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => {
              setCount(n);
              setValues(Array.from({ length: n }, () => rollOne()));
            }}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              count === n ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[72px] mb-5">
        {values.map((v, i) => {
          const Face = FACES[v - 1];
          return (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm ${rolling ? "animate-pulse" : ""}`}
            >
              <Face className="w-8 h-8" />
            </div>
          );
        })}
      </div>

      <div className="text-center mb-5">
        <span className="text-xs uppercase tracking-widest text-slate-400">Totale</span>
        <div className="text-3xl font-bold text-slate-900 tabular-nums">{total}</div>
      </div>

      <div className="flex justify-center">
        <Button onClick={roll} disabled={rolling} size="lg" className="rounded-full px-8">
          <Dices className="w-4 h-4 mr-2" />
          {rolling ? "Lancio..." : "Lancia"}
        </Button>
      </div>
    </Card>
  );
}