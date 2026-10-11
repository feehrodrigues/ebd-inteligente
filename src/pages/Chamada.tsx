import { RodapeChamada } from "../components/RodapeChamada";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  CalendarX,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { SeletorDomingo } from "../components/SeletorDomingo";
import { BlocoTurmaDia } from "../components/BlocoTurmaDia";
import {
  carregarChamada,
  salvarPresenca,
  marcarTurmaPresente,
  limparTurmaChamada,
  resumoDia,
  type LinhaChamada,
  type ResumoDia,
} from "../lib/api/chamadas";
import {
  listarDomingosDoPeriodo,
  domingoPadrao,
  atualizarDomingo,
} from "../lib/api/domingos";
import type { Domingo, StatusPresenca, Clima } from "../lib/types";

const CLIMA_EMOJI: Record<Clima, string> = {
  bom: "☀️",
  nublado: "☁️",
  ameacador: "🌥️",
  chuvoso: "🌧️",
  tempestuoso: "⛈️",
};

export function Chamada() {
  const { user } = useUser();
  const { sala, papel } = useSalaAtiva();
  const { periodo, carregando: carregandoPeriodo } = usePeriodo(sala?.id);

  const [domingos, setDomingos] = useState<Domingo[]>([]);
  const [domingoId, setDomingoId] = useState<string | null>(null);
  const [domingo, setDomingo] = useState<Domingo | null>(null);
  const [linhas, setLinhas] = useState<LinhaChamada[]>([]);
  const [resumo, setResumo] = useState<ResumoDia | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [turmasAbertas, setTurmasAbertas] = useState<Set<string>>(new Set());
  const [salvando, setSalvando] = useState<string | null>(null);

  const podeEditar = papel === "admin" || papel === "professor";

  useEffect(() => {
    if (!periodo) return;
    (async () => {
      const ds = await listarDomingosDoPeriodo(periodo.id);
      setDomingos(ds);
      if (!domingoId) {
        const padrao = await domingoPadrao(periodo.id);
        if (padrao) setDomingoId(padrao.id);
      }
    })();
  }, [periodo, domingoId]);

  const carregar = useCallback(async () => {
    if (!domingoId || !periodo) return;
    setCarregando(true);
    try {
      const [dadosChamada, resumoAtual, dom] = await Promise.all([
        carregarChamada(domingoId),
        resumoDia(domingoId),
        listarDomingosDoPeriodo(periodo.id).then(
          (ds) => ds.find((d) => d.id === domingoId) ?? null
        ),
      ]);
      setLinhas(dadosChamada);
      setResumo(resumoAtual);
      setDomingo(dom);

      const primeiraTurma = dadosChamada[0]?.turma_id;
      if (primeiraTurma && turmasAbertas.size === 0) {
        setTurmasAbertas(new Set([primeiraTurma]));
      }
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao carregar chamada");
    } finally {
      setCarregando(false);
    }
  }, [domingoId, periodo, turmasAbertas.size]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const turmas = useMemo(() => {
    const mapa = new Map<
      string,
      {
        turma_id: string;
        turma_nome: string;
        turma_faixa: string | null;
        turma_cor: string;
        turma_ordem: number;
        alunos: LinhaChamada[];
      }
    >();
    linhas.forEach((l) => {
      if (!mapa.has(l.turma_id)) {
        mapa.set(l.turma_id, {
          turma_id: l.turma_id,
          turma_nome: l.turma_nome,
          turma_faixa: l.turma_faixa,
          turma_cor: l.turma_cor,
          turma_ordem: l.turma_ordem,
          alunos: [],
        });
      }
      mapa.get(l.turma_id)!.alunos.push(l);
    });
    return Array.from(mapa.values()).sort(
      (a, b) => a.turma_ordem - b.turma_ordem
    );
  }, [linhas]);

  function toggleTurma(turmaId: string) {
    setTurmasAbertas((prev) => {
      const novo = new Set(prev);
      if (novo.has(turmaId)) novo.delete(turmaId);
      else novo.add(turmaId);
      return novo;
    });
  }

  async function marcarPresenca(linha: LinhaChamada, status: StatusPresenca) {
    if (!user || !domingoId) return;
    const chave = `${linha.pessoa_id}_${domingoId}`;
    const statusAtual = linha.presenca_status;
    const novoStatus = statusAtual === status ? null : status;

    setLinhas((prev) =>
      prev.map((l) =>
        l.pessoa_id === linha.pessoa_id
          ? { ...l, presenca_status: novoStatus as StatusPresenca | null }
          : l
      )
    );

    setSalvando(chave);
    try {
      await salvarPresenca({
        domingo_id: domingoId,
        pessoa_id: linha.pessoa_id,
        turma_id: linha.turma_id,
        status: novoStatus,
        user_id: user.id,
      });
      const r = await resumoDia(domingoId);
      setResumo(r);
    } catch (e: any) {
      setLinhas((prev) =>
        prev.map((l) =>
          l.pessoa_id === linha.pessoa_id
            ? { ...l, presenca_status: statusAtual }
            : l
        )
      );
      toast.error(e.message);
    } finally {
      setSalvando(null);
    }
  }

  async function marcarTodosPresentes(turmaId: string) {
    if (!user || !domingoId) return;
    if (!confirm("Marcar todos desta turma como presentes?")) return;
    try {
      await marcarTurmaPresente(domingoId, turmaId, user.id);
      toast.success("Todos marcados como presentes");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function limparTurma(turmaId: string) {
    if (!domingoId) return;
    if (!confirm("Limpar a chamada desta turma?")) return;
    try {
      await limparTurmaChamada(domingoId, turmaId);
      toast.success("Chamada limpa");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function mudarClima(clima: Clima | null) {
    if (!domingoId) return;
    try {
      await atualizarDomingo(domingoId, { clima });
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function toggleCancelada() {
    if (!domingoId || !domingo) return;
    try {
      await atualizarDomingo(domingoId, {
        aula_cancelada: !domingo.aula_cancelada,
        motivo_cancelamento: !domingo.aula_cancelada
          ? domingo.motivo_cancelamento ?? ""
          : null,
      });
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (!sala || carregandoPeriodo) return <Loading />;

  if (!periodo) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Chamada</h1>
        <div className="card">
          <Empty emoji="📅" titulo="Nenhum período ativo" />
        </div>
      </div>
    );
  }

  if (domingos.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Chamada</h1>
        <div className="card">
          <Empty emoji="📅" titulo="Nenhum domingo neste período" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Chamada</h1>
        <p className="text-sm text-slate-500">{periodo.nome}</p>
      </header>

      {domingoId && (
        <SeletorDomingo
          domingos={domingos}
          domingoId={domingoId}
          linhas={linhas}
          onChange={setDomingoId}
        />
      )}

      {/* Clima + cancelamento */}
      {domingo && (
        <div className="card">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              {(Object.keys(CLIMA_EMOJI) as Clima[]).map((c) => (
                <button
                  key={c}
                  onClick={() => mudarClima(domingo.clima === c ? null : c)}
                  disabled={!podeEditar}
                  className={`p-2 rounded-lg text-lg transition disabled:opacity-40 ${
                    domingo.clima === c
                      ? "bg-brand-100 ring-2 ring-brand-500"
                      : "hover:bg-slate-100"
                  }`}
                  title={c}
                >
                  {CLIMA_EMOJI[c]}
                </button>
              ))}
            </div>

            <button
              onClick={toggleCancelada}
              disabled={!podeEditar}
              className={`btn text-sm disabled:opacity-40 ${
                domingo.aula_cancelada
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <CalendarX size={14} />
              {domingo.aula_cancelada ? "Aula cancelada" : "Cancelar aula"}
            </button>
          </div>
        </div>
      )}

      {carregando ? (
        <Loading />
      ) : turmas.length === 0 ? (
        <div className="card">
          <Empty
            emoji="👥"
            titulo="Nenhum matriculado neste período"
            descricao="Adicione pessoas às turmas para fazer a chamada."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {turmas.map((t) => {
            const aberta = turmasAbertas.has(t.turma_id);
            const presentes = t.alunos.filter(
              (a) => a.presenca_status === "P"
            ).length;
            const total = t.alunos.length;

            return (
              <div key={t.turma_id} className="card p-0 overflow-hidden">
                <button
                  onClick={() => toggleTurma(t.turma_id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition"
                >
                  <span className="text-slate-400 shrink-0">
                    {aberta ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </span>
                  <div
                    className="w-2 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: t.turma_cor }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-800 truncate">
                      {t.turma_nome}
                    </p>
                    {t.turma_faixa && (
                      <p className="text-xs text-slate-500">{t.turma_faixa}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-600 shrink-0">
                    {presentes}/{total}
                  </span>
                </button>

                {aberta && (
                  <div className="border-t border-slate-100 p-3 space-y-2 bg-slate-50/50">
                    <div className="flex gap-2 pb-2">
                      <button
                        onClick={() => marcarTodosPresentes(t.turma_id)}
                        disabled={!podeEditar}
                        className="btn-success text-xs py-1.5 px-3 disabled:opacity-40"
                      >
                        <Check size={12} /> Todos presentes
                      </button>
                      <button
                        onClick={() => limparTurma(t.turma_id)}
                        disabled={!podeEditar}
                        className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-40"
                      >
                        <X size={12} /> Limpar
                      </button>
                    </div>

                    {t.alunos.map((a) => {
                      const st = a.presenca_status;
                      const suspensa = a.matricula_status === "suspensa";
                      const chave = `${a.pessoa_id}_${domingoId}`;
                      const salvandoEste = salvando === chave;

                      return (
                        <div
                          key={a.matricula_id}
                          className={`flex items-center gap-3 bg-white rounded-xl px-3 py-2 ${
                            suspensa ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">
                              {a.pessoa_nome}
                            </p>
                            {a.papel_na_turma === "professor" && (
                              <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                                👨‍🏫 Professor
                              </span>
                            )}
                            {suspensa && (
                              <span className="badge bg-slate-100 text-slate-500 text-[10px] ml-1">
                                Suspenso
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => marcarPresenca(a, "P")}
                              disabled={suspensa || salvandoEste || !podeEditar}
                              className={`w-10 h-10 rounded-xl font-bold transition disabled:opacity-40 ${
                                st === "P"
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600"
                              }`}
                            >
                              <Check size={18} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => marcarPresenca(a, "F")}
                              disabled={suspensa || salvandoEste || !podeEditar}
                              className={`w-10 h-10 rounded-xl font-bold transition disabled:opacity-40 ${
                                st === "F"
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600"
                              }`}
                            >
                              <X size={18} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => marcarPresenca(a, "J")}
                              disabled={suspensa || salvandoEste || !podeEditar}
                              className={`w-10 h-10 rounded-xl font-bold transition disabled:opacity-40 ${
                                st === "J"
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600"
                              }`}
                            >
                              <AlertCircle size={18} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Bíblias, revistas e visitantes */}
                    {domingoId && (
                      <BlocoTurmaDia
                        domingoId={domingoId}
                        turmaId={t.turma_id}
                        presentes={presentes}
                        podeEditar={podeEditar}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {resumo && !carregando && <RodapeChamada resumo={resumo} />}

    </div>
  );
}