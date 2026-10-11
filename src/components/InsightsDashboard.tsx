import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Star,
  Award,
  AlertCircle,
} from "lucide-react";
import { formatarData } from "../lib/dates";
import type { InsightsDashboard } from "../lib/api/dashboard";

export function InsightsDashboard({ insights }: { insights: InsightsDashboard }) {
  const {
    total_alunos,
    taxa_geral,
    alunos_risco,
    alunos_atencao,
    tendencia,
    media_recente,
    media_anterior,
    status,
    melhor_domingo,
    pior_domingo,
    aluno_destaque,
    turma_destaque,
  } = insights;

  const statusConfig = {
    saudavel: {
      cor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      label: "Saudável",
      emoji: "🟢",
      icone: <CheckCircle2 size={20} />,
      descricao: "O trimestre está indo bem",
    },
    atencao: {
      cor: "text-amber-700 bg-amber-50 border-amber-200",
      label: "Atenção",
      emoji: "🟡",
      icone: <AlertCircle size={20} />,
      descricao: "Vale prestar atenção em alguns pontos",
    },
    risco: {
      cor: "text-red-700 bg-red-50 border-red-200",
      label: "Risco",
      emoji: "🔴",
      icone: <AlertTriangle size={20} />,
      descricao: "Situação pede ação",
    },
  }[status];

  const tendenciaConfig = {
    subindo: {
      icone: <TrendingUp size={16} />,
      cor: "text-emerald-700",
      bg: "bg-emerald-50",
      label: "Subindo",
      delta: media_recente - media_anterior,
    },
    descendo: {
      icone: <TrendingDown size={16} />,
      cor: "text-red-700",
      bg: "bg-red-50",
      label: "Descendo",
      delta: media_recente - media_anterior,
    },
    estavel: {
      icone: <Minus size={16} />,
      cor: "text-slate-600",
      bg: "bg-slate-50",
      label: "Estável",
      delta: 0,
    },
  }[tendencia];

  return (
    <div className="space-y-4">
      {/* Status geral */}
      <div className={`card border ${statusConfig.cor}`}>
        <div className="flex items-center gap-3">
          <div className="shrink-0">{statusConfig.icone}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              Status do trimestre: {statusConfig.label}
            </p>
            <p className="text-xs opacity-80">{statusConfig.descricao}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">{taxa_geral}%</p>
            <p className="text-[10px] uppercase opacity-70">Taxa geral</p>
          </div>
        </div>
      </div>

      {/* Grid: tendência + alertas + destaques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tendência */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
            📈 Tendência recente
          </h3>
          <div
            className={`${tendenciaConfig.bg} rounded-xl p-4 flex items-center gap-3`}
          >
            <div className={tendenciaConfig.cor}>{tendenciaConfig.icone}</div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm ${tendenciaConfig.cor}`}>
                {tendenciaConfig.label}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {tendencia === "estavel"
                  ? `Média: ${media_recente}%`
                  : `${tendencia === "subindo" ? "+" : ""}${tendenciaConfig.delta.toFixed(
                      1
                    )}% vs. 3 domingos anteriores`}
              </p>
            </div>
            {tendencia !== "estavel" && (
              <div className="text-right shrink-0">
                <p className={`text-lg font-bold ${tendenciaConfig.cor}`}>
                  {media_recente}%
                </p>
                <p className="text-[10px] text-slate-500">
                  antes {media_anterior}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
            🚨 Alertas
          </h3>

          {alunos_risco === 0 && alunos_atencao === 0 ? (
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-emerald-800">
                  Tudo em ordem
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Nenhum aluno em situação crítica
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {alunos_risco > 0 && (
                <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
                  <AlertTriangle
                    size={18}
                    className="text-red-500 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-red-800">
                      {alunos_risco} aluno{alunos_risco > 1 ? "s" : ""} em
                      risco
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      3+ faltas seguidas
                    </p>
                  </div>
                </div>
              )}
              {alunos_atencao > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-amber-800">
                      {alunos_atencao} aluno{alunos_atencao > 1 ? "s" : ""} em
                      atenção
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      2 faltas seguidas
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Destaques */}
      <div className="card bg-gradient-to-br from-amber-50 to-brand-50 border-amber-200">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
          ⭐ Destaques do trimestre
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {turma_destaque && (
            <div className="bg-white rounded-xl p-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: turma_destaque.turma_cor + "20" }}
              >
                <Trophy
                  size={18}
                  style={{ color: turma_destaque.turma_cor }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 uppercase">
                  Melhor turma
                </p>
                <p className="font-semibold text-sm text-slate-800 truncate">
                  {turma_destaque.turma_nome}
                </p>
                <p className="text-xs text-slate-600">
                  {turma_destaque.taxa}% de presença
                </p>
              </div>
            </div>
          )}

          {aluno_destaque && (
            <div className="bg-white rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <Star size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 uppercase">
                  Aluno destaque
                </p>
                <p className="font-semibold text-sm text-slate-800 truncate">
                  {aluno_destaque.pessoa_nome}
                </p>
                <p className="text-xs text-slate-600">
                  {aluno_destaque.presentes} presenças ·{" "}
                  {aluno_destaque.taxa}%
                </p>
              </div>
            </div>
          )}

          {melhor_domingo && (
            <div className="bg-white rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Award size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 uppercase">
                  Melhor domingo
                </p>
                <p className="font-semibold text-sm text-slate-800">
                  {formatarData(melhor_domingo.data)}
                </p>
                <p className="text-xs text-slate-600">
                  {melhor_domingo.presentes} presentes ·{" "}
                  {melhor_domingo.taxa}%
                </p>
              </div>
            </div>
          )}

          {pior_domingo &&
            pior_domingo.data !== melhor_domingo?.data && (
              <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <TrendingDown size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Domingo mais fraco
                  </p>
                  <p className="font-semibold text-sm text-slate-800">
                    {formatarData(pior_domingo.data)}
                  </p>
                  <p className="text-xs text-slate-600">
                    {pior_domingo.presentes} presentes · {pior_domingo.taxa}%
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}