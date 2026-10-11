import { useState } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";
import type { ResultadoRenovacao } from "../lib/api/salas";

export function ChipRenovacao({
  resultado,
  onIrParaPeriodo,
  onDispensar,
}: {
  resultado: ResultadoRenovacao;
  onIrParaPeriodo: (trimestreId: string) => void;
  onDispensar: () => void;
}) {
  const [saindo, setSaindo] = useState(false);

  function dispensar() {
    setSaindo(true);
    setTimeout(() => {
      onDispensar();
    }, 200);
  }

  const criadoAgora = resultado.criado === true;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
        criadoAgora
          ? "bg-gradient-to-r from-violet-50 to-brand-50 border-violet-200"
          : "bg-amber-50 border-amber-200"
      } ${saindo ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          criadoAgora ? "bg-violet-100" : "bg-amber-100"
        }`}
      >
        <Sparkles
          size={18}
          className={criadoAgora ? "text-violet-600" : "text-amber-600"}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">
          {criadoAgora
            ? "✨ Próximo período criado automaticamente"
            : "📅 O próximo período já está pronto"}
        </p>
        <p className="text-xs text-slate-600 truncate">
          <strong>{resultado.nome}</strong> já tem os domingos gerados.
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {resultado.trimestre_id && (
          <button
            onClick={() => onIrParaPeriodo(resultado.trimestre_id!)}
            className="btn-primary text-xs px-3 py-1.5"
          >
            Ir <ArrowRight size={12} />
          </button>
        )}
        <button
          onClick={dispensar}
          className="btn-ghost p-1.5"
          title="Dispensar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}