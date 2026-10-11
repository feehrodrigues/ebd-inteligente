import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { Domingo } from "../lib/types";
import type { LinhaChamada } from "../lib/api/chamadas";

export function SeletorDomingo({
  domingos,
  domingoId,
  linhas,
  onChange,
}: {
  domingos: Domingo[];
  domingoId: string | null;
  linhas: LinhaChamada[];
  onChange: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipAtualRef = useRef<HTMLButtonElement>(null);

  const idxAtual = domingos.findIndex((d) => d.id === domingoId);

  // Centraliza o chip atual sempre que muda
  useEffect(() => {
    if (chipAtualRef.current && containerRef.current) {
      const chip = chipAtualRef.current;
      const container = containerRef.current;
      const offset =
        chip.offsetLeft - container.clientWidth / 2 + chip.clientWidth / 2;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [domingoId]);

  function irPara(index: number) {
    if (index >= 0 && index < domingos.length) {
      onChange(domingos[index].id);
    }
  }

  function irHoje() {
    const hoje = new Date().toISOString().slice(0, 10);
    const dom = domingos.find((d) => d.data === hoje);
    if (dom) onChange(dom.id);
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const temHoje = domingos.some((d) => d.data === hoje);
  const atual = domingos[idxAtual];

  function statusDomingo(d: Domingo): "cheio" | "vazio" | "cancelado" {
    if (d.aula_cancelada) return "cancelado";
    if (d.id !== domingoId) return "vazio";
    const temAlgo = linhas.some((l) => l.presenca_status);
    return temAlgo ? "cheio" : "vazio";
  }

  return (
    <div className="card p-3 space-y-3">
      {temHoje && atual?.data !== hoje && (
        <button
          onClick={irHoje}
          className="text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition"
        >
          <Clock size={12} /> Ir para hoje
        </button>
      )}

      <div className="flex items-center gap-2">
        {/* Seta esquerda */}
        <button
          onClick={() => irPara(idxAtual - 1)}
          disabled={idxAtual <= 0}
          className="shrink-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Faixa de chips com máscara nas pontas */}
        <div className="relative flex-1 overflow-hidden">
          {/* Sombra esquerda */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
          {/* Sombra direita */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />

          <div
            ref={containerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {domingos.map((d, i) => {
              const ativo = d.id === domingoId;
              const dist = Math.abs(i - idxAtual);
              const status = statusDomingo(d);
              const [, mes, dia] = d.data.split("-");

              return (
                <button
                  key={d.id}
                  ref={ativo ? chipAtualRef : null}
                  onClick={() => onChange(d.id)}
                  className={`shrink-0 transition-all duration-200 ${
                    ativo
                      ? "bg-brand-600 text-white shadow-lg ring-4 ring-brand-100 scale-100"
                      : dist === 1
                      ? "bg-slate-100 text-slate-500 scale-90 opacity-80"
                      : "bg-slate-50 text-slate-400 scale-80 opacity-60"
                  } ${
                    ativo
                      ? "rounded-2xl px-5 py-3 min-w-[90px]"
                      : "rounded-xl px-3 py-2 min-w-[60px]"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className={`font-bold leading-none ${
                        ativo ? "text-2xl" : "text-base"
                      }`}
                    >
                      {dia}
                    </span>
                    <span
                      className={`uppercase leading-none mt-1 ${
                        ativo
                          ? "text-[11px] text-brand-100 tracking-wider"
                          : "text-[10px] tracking-wide"
                      }`}
                    >
                      {mes}
                    </span>
                    {ativo && (
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          status === "cheio"
                            ? "bg-emerald-400"
                            : status === "cancelado"
                            ? "bg-red-400"
                            : "bg-white/40"
                        }`}
                        title={
                          status === "cheio"
                            ? "Chamada iniciada"
                            : status === "cancelado"
                            ? "Aula cancelada"
                            : "Sem chamada"
                        }
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seta direita */}
        <button
          onClick={() => irPara(idxAtual + 1)}
          disabled={idxAtual >= domingos.length - 1}
          className="shrink-0 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}