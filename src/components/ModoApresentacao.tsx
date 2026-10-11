import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BoletimDia } from "./BoletimDia";
import type { RelatorioDia } from "../lib/api/relatorio";

export function ModoApresentacao({
  dados,
  onFechar,
}: {
  dados: RelatorioDia;
  onFechar: () => void;
}) {
  const [secao, setSecao] = useState(0);
  const totalSecoes = 4;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowRight") setSecao((s) => Math.min(totalSecoes - 1, s + 1));
      if (e.key === "ArrowLeft") setSecao((s) => Math.max(0, s - 1));
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col">
      {/* Topo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="text-sm text-slate-400">
          EBD Inteligente · Modo apresentação
        </div>
        <button
          onClick={onFechar}
          className="p-2 rounded-lg hover:bg-slate-800 transition"
          title="Fechar (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-12">
          <div className="bg-white rounded-3xl p-6 md:p-10">
            <BoletimDia dados={dados} />
          </div>
        </div>
      </div>

      {/* Rodapé de navegação */}
      <div className="flex items-center justify-center gap-4 p-4 border-t border-slate-800">
        <button
          onClick={() => setSecao((s) => Math.max(0, s - 1))}
          disabled={secao === 0}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm text-slate-400">
          Use ← → para navegar · Esc para sair
        </span>
        <button
          onClick={() => setSecao((s) => Math.min(totalSecoes - 1, s + 1))}
          disabled={secao === totalSecoes - 1}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}