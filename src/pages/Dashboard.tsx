import { supabase } from "../lib/supabase";
import { ComparacaoTrimestres } from "../components/ComparacaoTrimestres";
import {
  obterComparacaoTrimestres,
  type ComparacaoTrimestres as ComparacaoType,
} from "../lib/api/dashboard";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  Book,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  Cake,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { useRenovacaoAutomatica } from "../hooks/useRenovacaoAutomatica";
import { ChipRenovacao } from "../components/ChipRenovacao";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { CardKPI } from "../components/CardKPI";
import { GraficoEvolucao } from "../components/GraficoEvolucao";
import { BarrasPresenca } from "../components/BarrasPresenca";
import { TabelaPorTurma } from "../components/TabelaPorTurma";
import { AbaPorTurma } from "../components/AbaPorTurma";
import { AbaPorAluno } from "../components/AbaPorAluno";
import { InsightsDashboard } from "../components/InsightsDashboard";
import {
  obterDashboardGeral,
  obterEvolucaoDomingos,
  obterProgressoLicoes,
  obterCoberturaEscala,
  obterAniversariantes,
  obterDashboardPorTurma,
  obterInsights,
  type DashboardGeral,
  type EvolucaoDomingo,
  type ProgressoLicoes,
  type CoberturaEscala,
  type Aniversariante,
  type DashboardTurma,
  type InsightsDashboard as InsightsType,
} from "../lib/api/dashboard";

export function Dashboard() {
  const nav = useNavigate();
  const { sala, papel } = useSalaAtiva();
  const { periodo, selecionar } = usePeriodo(sala?.id);
  const { resultado, dispensar } = useRenovacaoAutomatica(sala?.id);

  const [aba, setAba] = useState<"geral" | "turma" | "aluno">("geral");
  const [carregando, setCarregando] = useState(true);
  const [geral, setGeral] = useState<DashboardGeral | null>(null);
  const [evolucao, setEvolucao] = useState<EvolucaoDomingo[]>([]);
  const [licoes, setLicoes] = useState<ProgressoLicoes[]>([]);
  const [escala, setEscala] = useState<CoberturaEscala[]>([]);
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [dashboardTurma, setDashboardTurma] = useState<DashboardTurma[]>([]);
  const [insights, setInsights] = useState<InsightsType | null>(null);
const [comparacao, setComparacao] = useState<ComparacaoType | null>(null);

  const carregar = useCallback(async () => {
    if (!sala || !periodo) return;
    setCarregando(true);
    try {
      const mes = new Date().getMonth() + 1;
      const [g, ev, li, es, an, dt, ins] = await Promise.all([
  obterDashboardGeral(periodo.id),
  obterEvolucaoDomingos(periodo.id),
  obterProgressoLicoes(periodo.id),
  obterCoberturaEscala(periodo.id),
  obterAniversariantes(sala.id, mes),
  obterDashboardPorTurma(periodo.id),
  obterInsights(periodo.id),
]);
setGeral(g);
setEvolucao(ev);
setLicoes(li);
setEscala(es);
setAniversariantes(an);
setDashboardTurma(dt);
setInsights(ins);

// Busca trimestre anterior (se existir)
try {
  const { data: trimestres } = await supabase
    .from("trimestres")
    .select("*")
    .eq("sala_id", sala.id)
    .neq("id", periodo.id)
    .lt("ordem", periodo.ordem ?? 9999)
    .order("ordem", { ascending: false })
    .limit(1);
  if (trimestres && trimestres.length > 0) {
    const cmp = await obterComparacaoTrimestres(periodo.id, trimestres[0].id);
    setComparacao(cmp);
  } else {
    setComparacao(null);
  }
} catch {
  setComparacao(null);
}
    } catch (e: any) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [sala, periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function irParaPeriodo(trimestreId: string) {
    selecionar(trimestreId);
    dispensar();
  }

  if (!sala) return <Loading />;
  if (!periodo) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">{sala.nome}</h1>
        <div className="card">
          <Empty emoji="📅" titulo="Nenhum período ativo" />
        </div>
      </div>
    );
  }

  const progressoLicoes =
    geral && geral.licoes_total > 0
      ? Math.round((geral.licoes_preenchidas / geral.licoes_total) * 100)
      : 0;
  const progressoEscala =
    geral && geral.escala_total > 0
      ? Math.round((geral.escala_preenchida / geral.escala_total) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{sala.nome}</h1>
          <p className="text-sm text-slate-500">
            Painel · <strong>{papel}</strong> · {periodo.nome}
          </p>
        </div>
      </header>

      {resultado && (
        <ChipRenovacao
          resultado={resultado}
          onIrParaPeriodo={irParaPeriodo}
          onDispensar={dispensar}
        />
      )}

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(
          [
            ["geral", "Geral"],
            ["turma", "Por Turma"],
            ["aluno", "Por Aluno"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setAba(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              aba === v ? "bg-white shadow-sm text-brand-700" : "text-slate-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {carregando ? (
        <Loading />
      ) : aba === "geral" ? (
        <>
          {geral && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <CardKPI
                icone={<Users size={20} />}
                label="Matriculados"
                valor={geral.total_matriculados}
                sub={`${geral.total_turmas} turmas`}
                cor="text-brand-600"
              />
              <CardKPI
                icone={<TrendingUp size={20} />}
                label="Taxa de Presença"
                valor={`${geral.taxa_presenca}%`}
                sub={`${geral.domingos_com_chamada}/${geral.total_domingos} domingos`}
                cor={
                  geral.taxa_presenca >= 75
                    ? "text-emerald-600"
                    : geral.taxa_presenca >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }
              />
              <CardKPI
                icone={<CheckCircle2 size={20} />}
                label="Presenças"
                valor={geral.presentes}
                sub={`${geral.faltas} faltas · ${geral.justificados} just.`}
                cor="text-emerald-600"
              />
              <CardKPI
                icone={<UserPlus size={20} />}
                label="Visitantes"
                valor={geral.visitantes}
                sub="no período"
                cor="text-amber-600"
              />
            </div>
          )}

          {insights && <InsightsDashboard insights={insights} />}

{comparacao && <ComparacaoTrimestres dados={comparacao} />}

          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              📈 Evolução domingo a domingo
            </h2>
            <GraficoEvolucao dados={evolucao} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                📊 Distribuição de presenças
              </h2>
              {geral && (
                <BarrasPresenca
                  presentes={geral.presentes}
                  faltas={geral.faltas}
                  justificados={geral.justificados}
                />
              )}
            </div>

            <div className="card space-y-4">
              <h2 className="font-semibold flex items-center gap-2">
                🎯 Progresso
              </h2>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <BookOpenCheck size={14} /> Lições preenchidas
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {geral?.licoes_preenchidas ?? 0}/{geral?.licoes_total ?? 0}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all"
                    style={{ width: `${progressoLicoes}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {progressoLicoes}% completo
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <CalendarCheck size={14} /> Escala preenchida
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {geral?.escala_preenchida ?? 0}/{geral?.escala_total ?? 0}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${progressoEscala}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {progressoEscala}% completo
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Book size={16} className="text-brand-600" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">
                      Bíblias
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {geral?.biblias ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-600" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase">
                      Revistas
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {geral?.revistas ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              📋 Detalhamento por turma
            </h2>
            <TabelaPorTurma dados={dashboardTurma} />
          </div>

          <div className="card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Cake size={18} className="text-pink-500" />
              Aniversariantes do mês ({aniversariantes.length})
            </h2>
            {aniversariantes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum aniversariante este mês
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {aniversariantes.map((a) => (
                  <div
                    key={a.pessoa_id}
                    className="bg-pink-50 text-pink-800 rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-2"
                  >
                    🎂 {a.pessoa_nome}
                    <span className="text-xs bg-pink-200 text-pink-900 rounded-full px-2 py-0.5 font-bold">
                      dia {a.dia}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : aba === "turma" ? (
        <AbaPorTurma turmas={dashboardTurma} trimestreId={periodo.id} />
      ) : (
        <AbaPorAluno trimestreId={periodo.id} turmas={dashboardTurma} />
      )}
    </div>
  );
}