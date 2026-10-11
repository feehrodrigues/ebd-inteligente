import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  UserPlus,
  Book,
  BookOpen,
} from "lucide-react";
import type { ComparacaoTrimestres } from "../lib/api/dashboard";

export function ComparacaoTrimestres({
  dados,
}: {
  dados: ComparacaoTrimestres;
}) {
  const { atual, anterior } = dados;

  function delta(a: number, b: number) {
    if (b === 0) return null;
    return Math.round(((a - b) / b) * 1000) / 10;
  }

  const linhas = [
    {
      label: "Taxa de presença",
      atual: `${atual.taxa_presenca}%`,
      anterior: `${anterior.taxa_presenca}%`,
      delta: delta(atual.taxa_presenca, anterior.taxa_presenca),
      icone: <CheckCircle2 size={16} className="text-emerald-600" />,
    },
    {
      label: "Presentes",
      atual: atual.presentes,
      anterior: anterior.presentes,
      delta: delta(atual.presentes, anterior.presentes),
      icone: <CheckCircle2 size={16} className="text-emerald-600" />,
    },
    {
      label: "Visitantes",
      atual: atual.visitantes,
      anterior: anterior.visitantes,
      delta: delta(atual.visitantes, anterior.visitantes),
      icone: <UserPlus size={16} className="text-amber-600" />,
    },
    {
      label: "Bíblias",
      atual: atual.biblias,
      anterior: anterior.biblias,
      delta: delta(atual.biblias, anterior.biblias),
      icone: <Book size={16} className="text-brand-600" />,
    },
    {
      label: "Revistas",
      atual: atual.revistas,
      anterior: anterior.revistas,
      delta: delta(atual.revistas, anterior.revistas),
      icone: <BookOpen size={16} className="text-brand-600" />,
    },
  ];

  return (
    <div className="card bg-gradient-to-br from-slate-50 to-brand-50 border-brand-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold flex items-center gap-2">
          📊 Comparação de trimestres
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            <strong className="text-brand-700">{atual.nome}</strong>
          </span>
          <span>vs.</span>
          <span>{anterior.nome}</span>
        </div>
      </div>

      <div className="space-y-2">
        {linhas.map((linha) => {
          const d = linha.delta;
          const trend =
            d === null
              ? "sem-base"
              : d > 0
              ? "subiu"
              : d < 0
              ? "desceu"
              : "igual";

          return (
            <div
              key={linha.label}
              className="bg-white rounded-xl p-3 flex items-center gap-3"
            >
              <div className="shrink-0">{linha.icone}</div>
              <span className="flex-1 text-sm text-slate-700">
                {linha.label}
              </span>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-slate-800">
                  {linha.atual}
                </p>
                <p className="text-[10px] text-slate-400">
                  antes {linha.anterior}
                </p>
              </div>

              {trend !== "sem-base" && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0 ${
                    trend === "subiu"
                      ? "bg-emerald-50 text-emerald-700"
                      : trend === "desceu"
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {trend === "subiu" && <TrendingUp size={12} />}
                  {trend === "desceu" && <TrendingDown size={12} />}
                  {trend === "igual" && <Minus size={12} />}
                  {trend === "igual"
                    ? "0%"
                    : `${d > 0 ? "+" : ""}${d}%`}
                </div>
              )}

              {trend === "sem-base" && (
                <span className="text-xs text-slate-400 shrink-0">
                  sem base
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Domingos */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          {atual.domingos} domingos em {atual.nome}
        </span>
        <span>
          {anterior.domingos} domingos em {anterior.nome}
        </span>
      </div>
    </div>
  );
}