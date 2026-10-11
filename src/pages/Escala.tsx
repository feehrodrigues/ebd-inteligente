import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  X,
  Check,
  UserPlus,
  CalendarX,
  Users,
  Calendar,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import {
  listarEscalaDaTurma,
  listarProfessoresDaSala,
  resumoEscalaTrimestre,
  definirProfessor,
  type LinhaEscala,
  type ProfessorSala,
  type ResumoEscalaTurma,
} from "../lib/api/escala";
import { listarTurmas, type TurmaComContagens } from "../lib/api/turmas";
import { formatarData, formatarDataLonga } from "../lib/dates";

export function Escala() {
  const { sala, papel } = useSalaAtiva();
  const { periodo, carregando: carregandoPeriodo } = usePeriodo(sala?.id);

  const [turmas, setTurmas] = useState<TurmaComContagens[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaEscala[]>([]);
  const [professores, setProfessores] = useState<ProfessorSala[]>([]);
  const [resumo, setResumo] = useState<ResumoEscalaTurma[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [designando, setDesignando] = useState<string | null>(null); // domingo_id
  const [buscaProf, setBuscaProf] = useState("");

  const podeEditar = papel === "admin" || papel === "professor";

  // Carrega turmas e professores
  useEffect(() => {
    if (!sala || !periodo) return;
    (async () => {
      const [ts, ps] = await Promise.all([
        listarTurmas(sala.id, periodo.id),
        listarProfessoresDaSala(sala.id),
      ]);
      const ativas = ts.filter((t) => t.ativa);
      setTurmas(ativas);
      setProfessores(ps);
      if (!turmaSelecionada && ativas.length > 0) {
        setTurmaSelecionada(ativas[0].id);
      }
    })();
  }, [sala, periodo, turmaSelecionada]);

  // Carrega escala da turma + resumo
  const carregar = useCallback(async () => {
    if (!turmaSelecionada || !periodo) return;
    setCarregando(true);
    try {
      const [ls, rs] = await Promise.all([
        listarEscalaDaTurma(turmaSelecionada, periodo.id),
        resumoEscalaTrimestre(periodo.id),
      ]);
      setLinhas(ls);
      setResumo(rs);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCarregando(false);
    }
  }, [turmaSelecionada, periodo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const turma = useMemo(
    () => turmas.find((t) => t.id === turmaSelecionada),
    [turmas, turmaSelecionada]
  );

  const estatisticas = useMemo(() => {
    const ativos = linhas.filter(
      (l) => l.domingo_ativo && !l.domingo_cancelado
    );
    const comProf = ativos.filter((l) => l.pessoa_id).length;
    return { total: ativos.length, comProf };
  }, [linhas]);

  const professoresFiltrados = useMemo(() => {
    if (!buscaProf.trim()) return professores;
    return professores.filter((p) =>
      p.pessoa_nome.toLowerCase().includes(buscaProf.toLowerCase())
    );
  }, [professores, buscaProf]);

  async function designar(domingoId: string, pessoaId: string | null) {
    if (!turmaSelecionada) return;
    try {
      await definirProfessor({
        domingo_id: domingoId,
        turma_id: turmaSelecionada,
        pessoa_id: pessoaId,
      });
      toast.success(pessoaId ? "Professor designado" : "Designação removida");
      setDesignando(null);
      setBuscaProf("");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  const linhasFiltradas = useMemo(() => {
    if (!busca.trim()) return linhas;
    return linhas.filter(
      (l) =>
        l.pessoa_nome?.toLowerCase().includes(busca.toLowerCase()) ||
        formatarData(l.domingo_data).includes(busca)
    );
  }, [linhas, busca]);

  if (!sala || carregandoPeriodo) return <Loading />;

  if (!periodo) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Escala de Professores</h1>
        <div className="card">
          <Empty emoji="📅" titulo="Nenhum período ativo" />
        </div>
      </div>
    );
  }

  if (turmas.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Escala de Professores</h1>
        <div className="card">
          <Empty
            emoji="🎓"
            titulo="Nenhuma turma criada"
            descricao="Crie turmas primeiro."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Escala de Professores</h1>
        <p className="text-sm text-slate-500">
          Quem vai ministrar em cada domingo · {periodo.nome}
        </p>
      </header>

      {/* Seletor de turma */}
      <div className="flex flex-wrap gap-2">
        {turmas.map((t) => {
          const r = resumo.find((x) => x.turma_id === t.id);
          const pendentes = r ? r.total_domingos - r.domingos_com_professor : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTurmaSelecionada(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition flex items-center gap-2 ${
                turmaSelecionada === t.id
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              style={
                turmaSelecionada === t.id ? { backgroundColor: t.cor } : undefined
              }
            >
              {t.nome}
              {pendentes > 0 && (
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                    turmaSelecionada === t.id
                      ? "bg-white/30 text-white"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendentes}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Card de progresso */}
      {turma && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: turma.cor }}
              />
              <h2 className="font-semibold">{turma.nome}</h2>
            </div>
            <span className="text-sm text-slate-600 font-medium">
              {estatisticas.comProf} de {estatisticas.total} designados
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all rounded-full"
              style={{
                width: `${
                  estatisticas.total > 0
                    ? (estatisticas.comProf / estatisticas.total) * 100
                    : 0
                }%`,
                backgroundColor: turma.cor,
              }}
            />
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="input pl-9"
          placeholder="Buscar por professor ou data..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista de domingos */}
      {carregando ? (
        <Loading />
      ) : linhasFiltradas.length === 0 ? (
        <div className="card">
          <Empty
            emoji="📅"
            titulo={
              busca ? "Nenhum resultado" : "Nenhum domingo neste período"
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {linhasFiltradas.map((l) => {
            const desabilitado = !l.domingo_ativo || l.domingo_cancelado;
            const designandoEste = designando === l.domingo_id;

            return (
              <div
                key={l.domingo_id}
                className={`card py-3 ${desabilitado ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Data */}
                  <div className="w-16 shrink-0 text-center">
                    <p className="font-bold text-sm text-slate-800">
                      {formatarData(l.domingo_data)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatarDataLonga(l.domingo_data)
                        .split(",")[0]
                        .trim()}
                    </p>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    {designandoEste ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            className="input py-1.5 text-sm"
                            placeholder="Buscar professor..."
                            value={buscaProf}
                            onChange={(e) => setBuscaProf(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              setDesignando(null);
                              setBuscaProf("");
                            }}
                            className="btn-secondary text-xs px-3"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto bg-white rounded-lg border border-slate-200">
                          {professoresFiltrados.length === 0 ? (
                            <p className="text-xs text-slate-500 p-3 text-center">
                              {professores.length === 0
                                ? "Cadastre professores na aba Pessoas"
                                : "Nenhum professor encontrado"}
                            </p>
                          ) : (
                            professoresFiltrados.map((p) => (
                              <button
                                key={p.pessoa_id}
                                onClick={() =>
                                  designar(l.domingo_id, p.pessoa_id)
                                }
                                className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition border-b border-slate-100 last:border-0"
                              >
                                {p.pessoa_nome}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => podeEditar && setDesignando(l.domingo_id)}
                        disabled={!podeEditar || desabilitado}
                        className="text-left w-full group disabled:cursor-default"
                      >
                        {l.pessoa_id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                              {l.pessoa_nome?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                            <span className="font-medium text-sm text-slate-800">
                              {l.pessoa_nome}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic flex items-center gap-1.5">
                            <UserPlus size={14} />
                            Designar professor...
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0">
                    {l.domingo_cancelado && (
                      <CalendarX size={14} className="text-red-500" />
                    )}
                    {l.pessoa_id && !designandoEste && podeEditar && (
                      <button
                        onClick={() => designar(l.domingo_id, null)}
                        className="btn-ghost p-1.5 text-red-500"
                        title="Remover designação"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}