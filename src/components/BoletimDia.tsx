import { useState } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  UserPlus,
  Book,
  BookOpen,
  Trophy,
  Star,
  Sparkles,
  CalendarX,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Modal } from "./Modal";
import { formatarData, formatarDataLonga } from "../lib/dates";
import type { RelatorioDia } from "../lib/api/relatorio";
import type { Clima } from "../lib/types";
import { carregarChamada, type LinhaChamada } from "../lib/api/chamadas";

const CLIMA_EMOJI: Record<Clima, string> = {
  bom: "☀️",
  nublado: "☁️",
  ameacador: "🌥️",
  chuvoso: "🌧️",
  tempestuoso: "⛈️",
};

const CLIMA_LABEL: Record<Clima, string> = {
  bom: "Bom",
  nublado: "Nublado",
  ameacador: "Ameaçador",
  chuvoso: "Chuvoso",
  tempestuoso: "Tempestuoso",
};

export function BoletimDia({ dados }: { dados: RelatorioDia }) {
  const { domingo, trimestre, geral, comparativo, turmas, destaques } = dados;
  const [turmaDetalhe, setTurmaDetalhe] = useState<string | null>(null);
  const delta = comparativo.delta_taxa;

  const trend =
    delta === null
      ? "igual"
      : delta > 0
      ? "subiu"
      : delta < 0
      ? "desceu"
      : "igual";

  const totalAusentes =
    turmas.reduce((s, t) => s + t.faltas, 0) +
    turmas.reduce((s, t) => s + t.justificados, 0);

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="text-center pb-4 border-b border-slate-200">
        <p className="text-[11px] uppercase tracking-widest text-slate-500">
          Relatório do Domingo
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-brand-700 mt-1">
          {formatarDataLonga(domingo.data)}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-2 text-sm text-slate-500 flex-wrap">
          <span>{trimestre.nome}</span>
          {domingo.clima && (
            <>
              <span>·</span>
              <span>
                {CLIMA_EMOJI[domingo.clima as Clima]}{" "}
                {CLIMA_LABEL[domingo.clima as Clima]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Alerta de cancelamento */}
      {domingo.aula_cancelada && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
          <CalendarX className="text-red-500 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-800 text-sm">Aula cancelada</p>
            {domingo.motivo_cancelamento && (
              <p className="text-xs text-red-700">
                {domingo.motivo_cancelamento}
              </p>
            )}
          </div>
        </div>
      )}

      {/* KPIs grandes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPIBox
          label="Matriculados"
          valor={geral.total_matriculados}
          cor="text-slate-700"
          bg="bg-slate-50"
        />
        <KPIBox
          label="Presentes"
          valor={geral.presentes}
          cor="text-emerald-700"
          bg="bg-emerald-50"
          icone={<CheckCircle2 size={14} />}
        />
        <KPIBox
          label="Ausentes"
          valor={totalAusentes}
          cor="text-red-700"
          bg="bg-red-50"
          icone={<XCircle size={14} />}
        />
        <KPIBox
          label="Visitantes"
          valor={geral.visitantes}
          cor="text-amber-700"
          bg="bg-amber-50"
          icone={<UserPlus size={14} />}
        />
        <KPIBox
          label="Taxa"
          valor={`${geral.taxa_presenca}%`}
          cor="text-brand-700"
          bg="bg-brand-50"
          icone={<TrendingUp size={14} />}
        />
        <KPIBox
          label="Total no dia"
          valor={geral.presentes + geral.visitantes}
          cor="text-slate-700"
          bg="bg-slate-100"
          icone={<Users size={14} />}
        />
      </div>

      {/* Comparativo */}
      {comparativo.tem_anterior && delta !== null && (
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
              {comparativo.presentes_anterior} presentes antes ·{" "}
              {comparativo.taxa_anterior}%
            </p>
          </div>
        </div>
      )}

      {/* Tabela detalhada */}
      <div className="card">
        <h2 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
          📋 Detalhamento por turma
        </h2>

        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase text-slate-500 tracking-wide border-b border-slate-200">
                <th className="py-2 pr-3 font-semibold">Turma</th>
                <th className="py-2 px-2 text-center font-semibold">Mat.</th>
                <th className="py-2 px-2 text-center font-semibold text-emerald-700">
                  ✅
                </th>
                <th className="py-2 px-2 text-center font-semibold text-red-700">
                  ❌
                </th>
                <th className="py-2 px-2 text-center font-semibold text-amber-700">
                  ⚠️
                </th>
                <th className="py-2 px-2 text-center font-semibold text-slate-700">
                  👋
                </th>
                <th className="py-2 px-2 text-center font-semibold text-brand-700">
                  📕
                </th>
                <th className="py-2 px-2 text-center font-semibold text-brand-700">
                  📖
                </th>
                <th className="py-2 pl-2 text-right font-semibold">Taxa</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => {
                const total = t.presentes + t.faltas + t.justificados;
                const pct =
                  total > 0 ? Math.round((t.presentes / total) * 100) : 0;
                return (
                  <tr
                    key={t.turma_id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: t.turma_cor }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">
                            {t.turma_nome}
                          </p>
                          {t.turma_faixa && (
                            <p className="text-[10px] text-slate-500">
                              {t.turma_faixa}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600">
                      {t.total_alunos}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-emerald-700">
                      {t.presentes}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-red-700">
                      {t.faltas}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-amber-700">
                      {t.justificados}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                      {t.visitantes}
                    </td>
                    <td className="py-2.5 px-2 text-center text-brand-700">
                      {t.biblias}
                    </td>
                    <td className="py-2.5 px-2 text-center text-brand-700">
                      {t.revistas}
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          pct >= 75
                            ? "bg-emerald-50 text-emerald-700"
                            : pct >= 50
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                    <td className="pr-2">
                      <button
                        onClick={() => setTurmaDetalhe(t.turma_id)}
                        className="btn-ghost p-1.5 text-slate-400 hover:text-brand-700"
                        title="Ver alunos"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <td className="py-3 pr-3 text-slate-900">TOTAL GERAL</td>
                <td className="py-3 px-2 text-center text-slate-900">
                  {geral.total_matriculados}
                </td>
                <td className="py-3 px-2 text-center text-emerald-700">
                  {geral.presentes}
                </td>
                <td className="py-3 px-2 text-center text-red-700">
                  {turmas.reduce((s, t) => s + t.faltas, 0)}
                </td>
                <td className="py-3 px-2 text-center text-amber-700">
                  {turmas.reduce((s, t) => s + t.justificados, 0)}
                </td>
                <td className="py-3 px-2 text-center text-slate-700">
                  {geral.visitantes}
                </td>
                <td className="py-3 px-2 text-center text-brand-700">
                  {geral.biblias}
                </td>
                <td className="py-3 px-2 text-center text-brand-700">
                  {geral.revistas}
                </td>
                <td className="py-3 pl-2 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      geral.taxa_presenca >= 75
                        ? "bg-emerald-100 text-emerald-700"
                        : geral.taxa_presenca >= 50
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {geral.taxa_presenca}%
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Materiais */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            <Book size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Bíblias</p>
            <p className="text-2xl font-bold text-slate-800">{geral.biblias}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Revistas</p>
            <p className="text-2xl font-bold text-slate-800">
              {geral.revistas}
            </p>
          </div>
        </div>
      </div>

      {/* Destaques */}
      {(destaques.melhor_turma ||
        destaques.aluno_destaque ||
        destaques.turma_mais_visitantes) && (
        <div className="card bg-gradient-to-br from-amber-50 to-brand-50 border-amber-200">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-slate-800">
            <Sparkles size={16} className="text-amber-500" />
            Destaques do dia
          </h2>
          <div className="space-y-2">
            {destaques.melhor_turma && (
              <div className="flex items-center gap-3">
                <Trophy size={16} className="text-amber-500 shrink-0" />
                <span className="text-sm text-slate-700">
                  Melhor taxa:{" "}
                  <strong>{destaques.melhor_turma.turma_nome}</strong>{" "}
                  <span className="text-amber-700">
                    ({destaques.melhor_turma.taxa}%)
                  </span>
                </span>
              </div>
            )}
            {destaques.aluno_destaque &&
              destaques.aluno_destaque.presentes > 0 && (
                <div className="flex items-center gap-3">
                  <Star size={16} className="text-brand-500 shrink-0" />
                  <span className="text-sm text-slate-700">
                    Aluno destaque:{" "}
                    <strong>{destaques.aluno_destaque.pessoa_nome}</strong>{" "}
                    <span className="text-brand-700">
                      ({destaques.aluno_destaque.presentes} presenças no
                      trimestre)
                    </span>
                  </span>
                </div>
              )}
            {destaques.turma_mais_visitantes && (
              <div className="flex items-center gap-3">
                <UserPlus size={16} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-700">
                  Mais visitantes:{" "}
                  <strong>{destaques.turma_mais_visitantes.turma_nome}</strong>{" "}
                  <span className="text-emerald-700">
                    ({destaques.turma_mais_visitantes.visitantes})
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <p className="text-center text-xs text-slate-400 pt-2">
        EBD Inteligente ·{" "}
        {formatarData(new Date().toISOString().slice(0, 10))}
      </p>

      {/* Modal de detalhes da turma */}
      {turmaDetalhe && (
        <ModalDetalheTurma
          domingoId={domingo.id}
          turmaId={turmaDetalhe}
          turmaNome={
            turmas.find((t) => t.turma_id === turmaDetalhe)?.turma_nome ?? ""
          }
          turmaCor={
            turmas.find((t) => t.turma_id === turmaDetalhe)?.turma_cor ?? "#3b82f6"
          }
          onFechar={() => setTurmaDetalhe(null)}
        />
      )}
    </div>
  );
}

/* ---------- KPI box ---------- */

function KPIBox({
  label,
  valor,
  cor,
  bg,
  icone,
}: {
  label: string;
  valor: string | number;
  cor: string;
  bg: string;
  icone?: React.ReactNode;
}) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <div
        className={`flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide ${cor} mb-0.5`}
      >
        {icone}
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-extrabold ${cor}`}>{valor}</p>
    </div>
  );
}

/* ---------- Modal de detalhes da turma ---------- */

function ModalDetalheTurma({
  domingoId,
  turmaId,
  turmaNome,
  turmaCor,
  onFechar,
}: {
  domingoId: string;
  turmaId: string;
  turmaNome: string;
  turmaCor: string;
  onFechar: () => void;
}) {
  const [linhas, setLinhas] = useState<LinhaChamada[]>([]);
  const [carregando, setCarregando] = useState(true);

  useState(() => {
    (async () => {
      try {
        const dados = await carregarChamada(domingoId);
        setLinhas(dados.filter((l) => l.turma_id === turmaId));
      } finally {
        setCarregando(false);
      }
    })();
  });

  const presentes = linhas.filter((l) => l.presenca_status === "P");
  const faltas = linhas.filter((l) => l.presenca_status === "F");
  const justificados = linhas.filter((l) => l.presenca_status === "J");
  const semRegistro = linhas.filter((l) => !l.presenca_status);

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={`Alunos · ${turmaNome}`}
      larguraMax="max-w-lg"
    >
      {carregando ? (
        <p className="text-center text-sm text-slate-500 py-6">Carregando...</p>
      ) : linhas.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-6">
          Nenhum aluno matriculado nesta turma
        </p>
      ) : (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-emerald-700">
                {presentes.length}
              </p>
              <p className="text-[10px] text-emerald-700 uppercase">Pres.</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-red-700">{faltas.length}</p>
              <p className="text-[10px] text-red-700 uppercase">Aus.</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-amber-700">
                {justificados.length}
              </p>
              <p className="text-[10px] text-amber-700 uppercase">Just.</p>
            </div>
            <div className="bg-slate-100 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-slate-600">
                {semRegistro.length}
              </p>
              <p className="text-[10px] text-slate-500 uppercase">S/ reg.</p>
            </div>
          </div>

          {/* Lista por categoria */}
          {presentes.length > 0 && (
            <CategoriaAlunos
              titulo="✅ Presentes"
              cor="text-emerald-700"
              bgBadge="bg-emerald-50 text-emerald-700"
              alunos={presentes}
            />
          )}
          {faltas.length > 0 && (
            <CategoriaAlunos
              titulo="❌ Ausentes"
              cor="text-red-700"
              bgBadge="bg-red-50 text-red-700"
              alunos={faltas}
            />
          )}
          {justificados.length > 0 && (
            <CategoriaAlunos
              titulo="⚠️ Justificados"
              cor="text-amber-700"
              bgBadge="bg-amber-50 text-amber-700"
              alunos={justificados}
            />
          )}
          {semRegistro.length > 0 && (
            <CategoriaAlunos
              titulo="— Sem registro"
              cor="text-slate-500"
              bgBadge="bg-slate-100 text-slate-500"
              alunos={semRegistro}
            />
          )}
        </div>
      )}
    </Modal>
  );
}

function CategoriaAlunos({
  titulo,
  cor,
  bgBadge,
  alunos,
}: {
  titulo: string;
  cor: string;
  bgBadge: string;
  alunos: LinhaChamada[];
}) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${cor}`}>
        {titulo} ({alunos.length})
      </p>
      <div className="space-y-1">
        {alunos.map((a) => (
          <div
            key={a.matricula_id}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
              {a.pessoa_nome.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-700 flex-1 truncate">
              {a.pessoa_nome}
            </span>
            {a.papel_na_turma === "professor" && (
              <span className={`badge text-[10px] ${bgBadge}`}>👨‍🏫 Prof.</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}