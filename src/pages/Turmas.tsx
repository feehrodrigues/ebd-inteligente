import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Power,
  Users,
  GraduationCap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { Modal } from "../components/Modal";
import {
  listarTurmas,
  criarTurma,
  atualizarTurma,
  inativarTurma,
  reativarTurma,
  proximaOrdem,
  type TurmaComContagens,
} from "../lib/api/turmas";

type FiltroStatus = "ativas" | "inativas" | "todas";

const CORES_PADRAO = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
];

const FAIXAS_SUGERIDAS = [
  "Crianças",
  "Juniores",
  "Adolescentes",
  "Jovens",
  "Adultos",
  "Melhor Idade",
];

export function Turmas() {
  const { sala, papel } = useSalaAtiva();
  const { periodo: trimestre, carregando: carregandoTrimestre } = usePeriodo(sala?.id);

  const [turmas, setTurmas] = useState<TurmaComContagens[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<FiltroStatus>("ativas");

  const [modalAberto, setModalAberto] = useState(false);
  const [turmaEditando, setTurmaEditando] = useState<TurmaComContagens | null>(
    null
  );

  const podeEditar = papel === "admin" || papel === "professor";

  const carregar = useCallback(async () => {
    if (!sala || !trimestre) {
      setTurmas([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    try {
      const dados = await listarTurmas(sala.id, trimestre.id);
      setTurmas(dados);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao carregar turmas");
    } finally {
      setCarregando(false);
    }
  }, [sala, trimestre]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    return turmas.filter((t) => {
      if (filtro === "ativas") return t.ativa;
      if (filtro === "inativas") return !t.ativa;
      return true;
    });
  }, [turmas, filtro]);

  async function mover(turma: TurmaComContagens, direcao: -1 | 1) {
    const lista = [...turmas].sort((a, b) => a.ordem - b.ordem);
    const idx = lista.findIndex((t) => t.id === turma.id);
    const alvo = lista[idx + direcao];
    if (!alvo) return;
    try {
      await atualizarTurma(turma.id, { ordem: alvo.ordem });
      await atualizarTurma(alvo.id, { ordem: turma.ordem });
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function alternarStatus(t: TurmaComContagens) {
    try {
      if (t.ativa) {
        if (!confirm(`Inativar a turma "${t.nome}"?`)) return;
        await inativarTurma(t.id);
        toast.success("Turma inativada");
      } else {
        await reativarTurma(t.id);
        toast.success("Turma reativada");
      }
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (carregandoTrimestre) return <Loading />;

  if (!sala) return <Loading />;

  if (!trimestre) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Turmas</h1>
        <div className="card">
          <Empty
            emoji="📅"
            titulo="Nenhum trimestre ativo"
            descricao="Antes de criar turmas, você precisa de um trimestre ativo na sala. A tela de Trimestres será construída no próximo bloco."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Turmas</h1>
          <p className="text-sm text-slate-500">
            {trimestre.nome} · {turmas.filter((t) => t.ativa).length} ativas
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => {
              setTurmaEditando(null);
              setModalAberto(true);
            }}
            className="btn-primary"
          >
            <Plus size={18} /> Nova turma
          </button>
        )}
      </header>

      {/* Filtros */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(
          [
            ["ativas", "Ativas"],
            ["inativas", "Inativas"],
            ["todas", "Todas"],
          ] as [FiltroStatus, string][]
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFiltro(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filtro === v ? "bg-white shadow-sm text-brand-700" : "text-slate-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Lista */}
      {carregando ? (
        <Loading />
      ) : filtradas.length === 0 ? (
        <div className="card">
          <Empty
            emoji="🎓"
            titulo={
              turmas.length === 0
                ? "Nenhuma turma criada"
                : "Nenhuma turma neste filtro"
            }
            descricao={
              turmas.length === 0
                ? "Turmas organizam alunos e professores por faixa etária ou nível de estudo."
                : undefined
            }
            acao={
              turmas.length === 0 && podeEditar ? (
                <button
                  onClick={() => {
                    setTurmaEditando(null);
                    setModalAberto(true);
                  }}
                  className="btn-primary"
                >
                  <Plus size={18} /> Criar primeira turma
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map((t, idx) => (
            <div
              key={t.id}
              className={`card flex flex-wrap items-center gap-3 ${
                !t.ativa ? "opacity-60" : ""
              }`}
            >
              <div
                className="w-1.5 self-stretch rounded-full shrink-0"
                style={{ backgroundColor: t.cor }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 truncate">
                    {t.nome}
                  </h3>
                  {t.faixa && (
                    <span
                      className="badge"
                      style={{
                        backgroundColor: t.cor + "20",
                        color: t.cor,
                      }}
                    >
                      {t.faixa}
                    </span>
                  )}
                  {!t.ativa && (
                    <span className="badge bg-slate-100 text-slate-500">
                      Inativa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users size={13} />
                    {t.total_alunos} aluno{t.total_alunos !== 1 ? "s" : ""}
                  </span>
                  {t.total_professores > 0 && (
                    <span className="flex items-center gap-1">
                      <GraduationCap size={13} />
                      {t.total_professores} prof.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                {podeEditar && t.ativa && (
                  <>
                    <button
                      onClick={() => mover(t, -1)}
                      disabled={idx === 0}
                      className="btn-ghost p-2 disabled:opacity-30"
                      title="Mover pra cima"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => mover(t, 1)}
                      disabled={idx === filtradas.length - 1}
                      className="btn-ghost p-2 disabled:opacity-30"
                      title="Mover pra baixo"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setTurmaEditando(t);
                    setModalAberto(true);
                  }}
                  className="btn-ghost p-2"
                  title="Editar e gerenciar matriculados"
                >
                  <Pencil size={16} />
                </button>

                {podeEditar && (
                  <button
                    onClick={() => alternarStatus(t)}
                    className="btn-ghost p-2"
                    title={t.ativa ? "Inativar" : "Reativar"}
                  >
                    <Power
                      size={16}
                      className={t.ativa ? "text-red-500" : "text-emerald-500"}
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sala && trimestre && (
        <ModalTurma
          aberto={modalAberto}
          onFechar={() => setModalAberto(false)}
          turma={turmaEditando}
          salaId={sala.id}
          trimestreId={trimestre.id}
          onSalvo={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

/* ---------- Modal de turma (com matrículas inline) ---------- */

import { GerenciarMatriculas } from "../components/GerenciarMatriculas";
import type { Turma } from "../lib/types";

function ModalTurma({
  aberto,
  onFechar,
  turma,
  salaId,
  trimestreId,
  onSalvo,
}: {
  aberto: boolean;
  onFechar: () => void;
  turma: TurmaComContagens | null;
  salaId: string;
  trimestreId: string;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState("");
  const [faixa, setFaixa] = useState("");
  const [cor, setCor] = useState(CORES_PADRAO[0]);
  const [salvando, setSalvando] = useState(false);
  const [turmaCriada, setTurmaCriada] = useState<Turma | null>(null);

  useEffect(() => {
    if (aberto) {
      setNome(turma?.nome ?? "");
      setFaixa(turma?.faixa ?? "");
      setCor(turma?.cor ?? CORES_PADRAO[0]);
      setTurmaCriada(null);
    }
  }, [aberto, turma]);

  async function salvar() {
    if (!nome.trim()) return toast.error("Informe o nome da turma");
    setSalvando(true);
    try {
      if (turma) {
        await atualizarTurma(turma.id, {
          nome: nome.trim(),
          faixa: faixa.trim(),
          cor,
        });
        toast.success("Turma atualizada");
        onSalvo();
      } else {
        const ordem = await proximaOrdem(salaId);
        const criada = await criarTurma({
          sala_id: salaId,
          nome,
          faixa,
          cor,
          ordem,
        });
        toast.success("Turma criada! Agora adicione alunos e professores.");
        setTurmaCriada(criada);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  const idTurmaAtual = turma?.id ?? turmaCriada?.id;

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={turma ? "Editar turma" : "Nova turma"}
      larguraMax="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Dados da turma */}
        <div className="space-y-4">
          <div>
            <label className="label">Nome da turma *</label>
            <input
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder='Ex: "Heróis da Fé", "Criancinhas de Jesus"'
              autoFocus
              disabled={!!turmaCriada}
            />
          </div>

          <div>
            <label className="label">Faixa / categoria</label>
            <input
              className="input"
              value={faixa}
              onChange={(e) => setFaixa(e.target.value)}
              placeholder="Ex: Crianças, Adolescentes, Adultos"
              disabled={!!turmaCriada}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {FAIXAS_SUGERIDAS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFaixa(f)}
                  disabled={!!turmaCriada}
                  className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition disabled:opacity-40"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Cor</label>
            <div className="flex flex-wrap gap-2">
              {CORES_PADRAO.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  disabled={!!turmaCriada}
                  className={`w-9 h-9 rounded-full transition ${
                    cor === c
                      ? "ring-2 ring-offset-2 ring-slate-400"
                      : "hover:scale-110"
                  } ${turmaCriada ? "opacity-40" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botão de salvar (só pra criar ou editar dados básicos) */}
        {!turmaCriada ? (
          <div className="flex gap-2 pt-2">
            <button onClick={onFechar} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="btn-primary flex-1"
            >
              {salvando ? "Salvando..." : turma ? "Salvar" : "Criar turma"}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
            ✅ Turma criada! Adicione alunos e professores abaixo.
          </div>
        )}

        {/* Gerenciar matrículas */}
        {idTurmaAtual && (
          <div className="pt-2 border-t border-slate-200">
            <GerenciarMatriculas
              turmaId={idTurmaAtual}
              salaId={salaId}
              trimestreId={trimestreId}
              cor={cor}
            />
          </div>
        )}

        {turmaCriada && (
          <div className="flex gap-2">
            <button onClick={onSalvo} className="btn-primary flex-1">
              Concluir
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}