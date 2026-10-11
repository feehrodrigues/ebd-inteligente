import { useCallback, useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  Trophy,
  Medal,
  AlertTriangle,
} from "lucide-react";
import { Loading } from "./Loading";
import { Empty } from "./Empty";
import { CardKPI } from "./CardKPI";
import { GraficoEvolucao } from "./GraficoEvolucao";
import { BarrasPresenca } from "./BarrasPresenca";
import {
  obterEvolucaoTurma,
  obterRankingTurma,
  type DashboardTurma,
  type EvolucaoDomingo,
  type RankingTurmaAluno,
} from "../lib/api/dashboard";

export function AbaPorTurma({
  turmas,
  trimestreId,
}: {
  turmas: DashboardTurma[];
  trimestreId: string;
}) {
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(
    turmas[0]?.turma_id ?? null
  );
  const [evolucao, setEvolucao] = useState<EvolucaoDomingo[]>([]);
  const [ranking, setRanking] = useState<RankingTurmaAluno[]>([]);
  const [carregando, setCarregando] = useState(false);

  const turma = turmas.find((t) => t.turma_id === turmaSelecionada);

  const carregar = useCallback(async () => {
    if (!turmaSelecionada) return;
    setCarregando(true);
    try {
      const [ev, rk] = await Promise.all([
        obterEvolucaoTurma(turmaSelecionada, trimestreId),
        obterRankingTurma(turmaSelecionada, trimestreId),
      ]);
      setEvolucao(ev);
      setRanking(rk);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [turmaSelecionada, trimestreId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (turmas.length === 0) {
    return (
      <div className="card">
        <Empty emoji="🎓" titulo="Nenhuma turma criada" />
      </div>
    );
  }

  // Top 3 e últimos 3
  const top3 = ranking.slice(0, 3);
  const ultimos = ranking.slice(-3).reverse();

  return (
    <div className="space-y-5">
      {/* Seletor de turma */}
      <div className="flex flex-wrap gap-2">
        {turmas.map((t) => (
          <button
            key={t.turma_id}
            onClick={() => setTurmaSelecionada(t.turma_id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition flex items-center gap-2 ${
              turmaSelecionada === t.turma_id
                ? "text-white border-transparent shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            style={
              turmaSelecionada === t.turma_id
                ? { backgroundColor: t.turma_cor }
                : undefined
            }
          >
            {t.turma_nome}
            <span
              className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                turmaSelecionada === t.turma_id
                  ? "bg-white/30 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {t.total_alunos}
            </span>
          </button>
        ))}
      </div>

      {carregando ? (
        <Loading />
      ) : turma ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CardKPI
              icone={<Users size={20} />}
              label="Alunos"
              valor={turma.total_alunos}
              sub={turma.turma_faixa ?? "—"}
              cor="text-brand-600"
            />
            <CardKPI
              icone={<TrendingUp size={20} />}
              label="Taxa"
              valor={`${turma.taxa_presenca}%`}
              sub="do período"
              cor={
                turma.taxa_presenca >= 75
                  ? "text-emerald-600"
                  : turma.taxa_presenca >= 50
                  ? "text-amber-600"
                  : "text-red-600"
              }
            />
            <CardKPI
              icone={<CheckCircle2 size={20} />}
              label="Presenças"
              valor={turma.presentes}
              sub={`${turma.faltas} faltas · ${turma.justificados} just.`}
              cor="text-emerald-600"
            />
            <CardKPI
              icone={<UserPlus size={20} />}
              label="Visitantes"
              valor={turma.visitantes}
              sub="no período"
              cor="text-amber-600"
            />
          </div>

          {/* Evolução da turma */}
          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              📈 Evolução de {turma.turma_nome}
            </h2>
            <GraficoEvolucao dados={evolucao} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribuição */}
            <div className="card">
              <h2 className="font-semibold mb-4">📊 Distribuição</h2>
              <BarrasPresenca
                presentes={turma.presentes}
                faltas={turma.faltas}
                justificados={turma.justificados}
              />
            </div>

            {/* Materiais */}
            <div className="card space-y-4">
              <h2 className="font-semibold">📚 Materiais da turma</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Bíblias
                  </p>
                  <p className="text-2xl font-bold text-brand-700">
                    {turma.biblias}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">
                    Revistas
                  </p>
                  <p className="text-2xl font-bold text-brand-700">
                    {turma.revistas}
                  </p>
                </div>
              </div>

              {/* Destaques */}
              {top3.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-500" /> Top
                    presenças
                  </p>
                  <div className="space-y-1.5">
                    {top3.map((a, i) => (
                      <div
                        key={a.pessoa_id}
                        className="flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-slate-700 truncate">
                          {a.pessoa_nome}
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {a.taxa_presenca}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ultimos.length > 0 && ultimos[0].taxa_presenca < 50 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-red-500" /> Atenção
                  </p>
                  <div className="space-y-1.5">
                    {ultimos.map((a) => (
                      <div
                        key={a.pessoa_id}
                        className="flex items-center gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
                          !
                        </span>
                        <span className="flex-1 text-sm text-slate-700 truncate">
                          {a.pessoa_nome}
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {a.taxa_presenca}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ranking completo */}
          {ranking.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Medal size={18} className="text-brand-600" />
                Ranking de {turma.turma_nome} ({ranking.length} alunos)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-3 font-semibold w-8">#</th>
                      <th className="py-2 pr-3 font-semibold">Aluno</th>
                      <th className="py-2 px-2 text-center font-semibold">
                        ✅
                      </th>
                      <th className="py-2 px-2 text-center font-semibold">
                        ❌
                      </th>
                      <th className="py-2 px-2 text-center font-semibold">
                        ⚠️
                      </th>
                      <th className="py-2 pl-2 text-right font-semibold">
                        Taxa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((a, i) => (
                      <tr
                        key={a.pessoa_id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-2 pr-3 text-slate-500 font-medium">
                          {i + 1}
                        </td>
                        <td className="py-2 pr-3 text-slate-800 font-medium truncate">
                          {a.pessoa_nome}
                        </td>
                        <td className="py-2 px-2 text-center text-emerald-700 font-semibold">
                          {a.presentes}
                        </td>
                        <td className="py-2 px-2 text-center text-red-700 font-semibold">
                          {a.faltas}
                        </td>
                        <td className="py-2 px-2 text-center text-amber-700 font-semibold">
                          {a.justificados}
                        </td>
                        <td className="py-2 pl-2 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                              a.taxa_presenca >= 75
                                ? "bg-emerald-50 text-emerald-700"
                                : a.taxa_presenca >= 50
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {a.taxa_presenca}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}