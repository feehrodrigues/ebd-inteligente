import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronDown, Check, Settings2 } from "lucide-react";
import type { Trimestre } from "../lib/types";

export function SeletorPeriodo({
  periodoAtual,
  periodos,
  onSelecionar,
}: {
  periodoAtual: Trimestre | null;
  periodos: Trimestre[];
  onSelecionar: (id: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const recentes = periodos.slice(0, 3);

  if (!periodoAtual) {
    return (
      <button
        onClick={() => nav("/app/trimestres")}
        className="btn-secondary text-xs"
      >
        <CalendarDays size={14} /> Criar período
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto((v) => !v)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-50 transition"
      >
        <CalendarDays size={15} className="text-brand-600" />
        <span className="truncate max-w-[140px] md:max-w-none">
          {periodoAtual.nome}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg w-64 overflow-hidden animate-fade-in">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            Períodos recentes
          </div>

          {recentes.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                onSelecionar(p.id);
                setAberto(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-50 transition ${
                p.id === periodoAtual.id ? "bg-brand-50" : ""
              }`}
            >
              {p.id === periodoAtual.id ? (
                <Check size={14} className="text-brand-600 shrink-0" />
              ) : (
                <span className="w-3.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-700 truncate">{p.nome}</p>
                <p className="text-[10px] text-slate-400">
                  {p.data_inicio} → {p.data_fim}
                </p>
              </div>
            </button>
          ))}

          <div className="border-t border-slate-100">
            <button
              onClick={() => {
                setAberto(false);
                nav("/app/trimestres");
              }}
              className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-600 transition"
            >
              <Settings2 size={14} />
              Ver todos os períodos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}