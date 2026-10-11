import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Book,
  BookOpen,
  Users,
  Check,
  X,
  AlertCircle,
  Percent,
} from "lucide-react";
import type { ResumoDia } from "../lib/api/chamadas";

export function RodapeChamada({ resumo }: { resumo: ResumoDia }) {
  const [expandido, setExpandido] = useState(false);

  const delta =
    resumo.taxa_anterior !== null
      ? Number((resumo.taxa_presenca - resumo.taxa_anterior).toFixed(1))
      : null;

  const trend =
    delta === null
      ? "igual"
      : delta > 0
      ? "subiu"
      : delta < 0
      ? "desceu"
      : "igual";

  return (
    <div className="card sticky bottom-4 shadow-xl border-brand-200 bg-white">
      {/* Cabeçalho compacto (sempre visível) */}
      <button
        onClick={() => setExpandido((v) => !v)}
        className="w-full flex items-center justify-between gap-3"
      >
        <div className="grid grid-cols-4 gap-3 flex-1 text-center">
          <div>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">
              {resumo.presentes}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Presentes
            </p>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-red-600">
              {resumo.faltas}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Faltas
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xl md:text-2xl font-bold text-brand-600">
                {resumo.taxa_presenca}%
              </p>
              {trend === "subiu" && (
                <TrendingUp size={14} className="text-emerald-500" />
              )}
              {trend === "desceu" && (
                <TrendingDown size={14} className="text-red-500" />
              )}
              {trend === "igual" && delta !== null && (
                <Minus size={14} className="text-slate-400" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Taxa
            </p>
          </div>
          <div>
            <p className="text-xl md:text-2xl font-bold text-amber-600">
              {resumo.visitantes}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">
              Visitantes
            </p>
          </div>
        </div>

        <span className="text-slate-400 shrink-0">
          {expandido ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </span>
      </button>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
          {/* Comparação com o domingo anterior */}
          {resumo.tem_anterior && delta !== null ? (
            <div
              className={`rounded-xl p-3 flex items-center gap-3 ${
                trend === "subiu"
                  ? "bg-emerald-50 text-emerald-800"
                  : trend === "desceu"
                  ? "bg-red-50 text-red-800"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              {trend === "subiu" && <TrendingUp size={18} />}
              {trend === "desceu" && <TrendingDown size={18} />}
              {trend === "igual" && <Minus size={18} />}
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {trend === "subiu"
                    ? `Subiu ${delta}% vs. domingo anterior`
                    : trend === "desceu"
                    ? `Desceu ${Math.abs(delta)}% vs. domingo anterior`
                    : "Igual ao domingo anterior"}
                </p>
                <p className="text-xs opacity-80">
                  {resumo.presentes_anterior} presentes no domingo passado ·{" "}
                  {resumo.taxa_anterior}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-2">
              Primeiro domingo com chamada neste período
            </p>
          )}

          {/* Grid de detalhes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <DetalheCard
              icon={<Users size={14} />}
              label="Total"
              valor={resumo.total_matriculados}
              cor="text-slate-600"
            />
            <DetalheCard
              icon={<AlertCircle size={14} />}
              label="Justificados"
              valor={resumo.justificados}
              cor="text-amber-600"
            />
            <DetalheCard
              icon={<Book size={14} />}
              label="Bíblias"
              valor={resumo.biblias}
              cor="text-brand-600"
            />
            <DetalheCard
              icon={<BookOpen size={14} />}
              label="Revistas"
              valor={resumo.revistas}
              cor="text-brand-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetalheCard({
  icon,
  label,
  valor,
  cor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: number;
  cor: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-2">
      <span className={cor}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-sm font-bold ${cor}`}>{valor}</p>
      </div>
    </div>
  );
}