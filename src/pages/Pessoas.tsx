import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, UserX, UserCheck, Users } from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { Modal } from "../components/Modal";
import {
  listarPessoas,
  criarPessoa,
  atualizarPessoa,
  inativarPessoa,
  reativarPessoa,
  type PessoaComTurmas,
} from "../lib/api/pessoas";
import type { TipoPessoa } from "../lib/types";

type FiltroTipo = "todos" | "alunos" | "professores";
type FiltroStatus = "ativos" | "inativos" | "todos";

const LABEL_TIPO: Record<TipoPessoa, string> = {
  aluno: "Aluno",
  professor: "Professor",
  ambos: "Aluno e Professor",
};

export function Pessoas() {
  const { sala } = useSalaAtiva();
  const [pessoas, setPessoas] = useState<PessoaComTurmas[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("ativos");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<PessoaComTurmas | null>(null);

  const carregar = useCallback(async () => {
    if (!sala) return;
    setCarregando(true);
    try {
      const dados = await listarPessoas(sala.id);
      setPessoas(dados);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao carregar pessoas");
    } finally {
      setCarregando(false);
    }
  }, [sala]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    return pessoas.filter((p) => {
      if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase()))
        return false;
      if (filtroStatus === "ativos" && !p.ativo) return false;
      if (filtroStatus === "inativos" && p.ativo) return false;
      if (filtroTipo === "alunos" && p.tipo === "professor") return false;
      if (filtroTipo === "professores" && p.tipo === "aluno") return false;
      return true;
    });
  }, [pessoas, busca, filtroTipo, filtroStatus]);

  const stats = useMemo(() => {
    const ativos = pessoas.filter((p) => p.ativo);
    return {
      total: ativos.length,
      alunos: ativos.filter((p) => p.tipo === "aluno" || p.tipo === "ambos")
        .length,
      professores: ativos.filter(
        (p) => p.tipo === "professor" || p.tipo === "ambos"
      ).length,
    };
  }, [pessoas]);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(p: PessoaComTurmas) {
    setEditando(p);
    setModalAberto(true);
  }

  async function alternarStatus(p: PessoaComTurmas) {
    try {
      if (p.ativo) {
        if (!confirm(`Inativar "${p.nome}"? O histórico é mantido.`)) return;
        await inativarPessoa(p.id);
        toast.success("Pessoa inativada");
      } else {
        await reativarPessoa(p.id);
        toast.success("Pessoa reativada");
      }
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (!sala) return <Loading />;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pessoas</h1>
          <p className="text-sm text-slate-500">
            Cadastro único da sala — alunos e professores saem daqui
          </p>
        </div>
        <button onClick={abrirNovo} className="btn-primary">
          <Plus size={18} /> Nova pessoa
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-brand-700">{stats.total}</p>
          <p className="text-xs text-slate-500 mt-0.5">Ativos</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.alunos}</p>
          <p className="text-xs text-slate-500 mt-0.5">Alunos</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {stats.professores}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Professores</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card space-y-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-10"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(
              [
                ["todos", "Todos"],
                ["alunos", "Alunos"],
                ["professores", "Professores"],
              ] as [FiltroTipo, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFiltroTipo(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filtroTipo === v
                    ? "bg-white shadow-sm text-brand-700"
                    : "text-slate-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(
              [
                ["ativos", "Ativos"],
                ["inativos", "Inativos"],
                ["todos", "Todos"],
              ] as [FiltroStatus, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFiltroStatus(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filtroStatus === v
                    ? "bg-white shadow-sm text-brand-700"
                    : "text-slate-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      {carregando ? (
        <Loading />
      ) : filtradas.length === 0 ? (
        <div className="card">
          <Empty
            emoji="🧑‍🎓"
            titulo={
              pessoas.length === 0
                ? "Nenhuma pessoa cadastrada"
                : "Nenhum resultado"
            }
            descricao={
              pessoas.length === 0
                ? "Comece cadastrando quem faz parte da sua EBD. Tudo o mais se conecta a essas pessoas."
                : "Ajuste a busca ou os filtros."
            }
            acao={
              pessoas.length === 0 ? (
                <button onClick={abrirNovo} className="btn-primary">
                  <Plus size={18} /> Cadastrar primeira pessoa
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((p) => (
            <div
              key={p.id}
              className={`card py-3 flex items-center gap-3 ${
                !p.ativo ? "opacity-60" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold shrink-0">
                {p.nome.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {p.nome}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  <span className="text-xs text-slate-500">
                    {LABEL_TIPO[p.tipo]}
                  </span>
                  {p.total_turmas > 0 && (
                    <span className="badge bg-emerald-50 text-emerald-700">
                      <Users size={11} /> {p.total_turmas} turma
                      {p.total_turmas !== 1 ? "s" : ""}
                    </span>
                  )}
                  {p.total_turmas_professor > 0 && (
                    <span className="badge bg-amber-50 text-amber-700">
                      👨‍🏫 {p.total_turmas_professor}
                    </span>
                  )}
                  {!p.ativo && (
                    <span className="badge bg-slate-100 text-slate-500">
                      Inativo
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => abrirEdicao(p)}
                  className="btn-ghost p-2"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => alternarStatus(p)}
                  className="btn-ghost p-2"
                  title={p.ativo ? "Inativar" : "Reativar"}
                >
                  {p.ativo ? (
                    <UserX size={16} className="text-red-500" />
                  ) : (
                    <UserCheck size={16} className="text-emerald-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalPessoa
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pessoa={editando}
        salaId={sala.id}
        onSalvo={() => {
          setModalAberto(false);
          carregar();
        }}
      />
    </div>
  );
}

/* ---------- Modal de criar/editar ---------- */

function ModalPessoa({
  aberto,
  onFechar,
  pessoa,
  salaId,
  onSalvo,
}: {
  aberto: boolean;
  onFechar: () => void;
  pessoa: PessoaComTurmas | null;
  salaId: string;
  onSalvo: () => void;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [tipo, setTipo] = useState<TipoPessoa>("aluno");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) {
      setNome(pessoa?.nome ?? "");
      setTelefone(pessoa?.telefone ?? "");
      setNascimento(pessoa?.data_nascimento ?? "");
      setTipo(pessoa?.tipo ?? "aluno");
    }
  }, [aberto, pessoa]);

  async function salvar() {
    if (!nome.trim()) return toast.error("Informe o nome");
    setSalvando(true);
    try {
      if (pessoa) {
        await atualizarPessoa(pessoa.id, {
          nome: nome.trim(),
          telefone: telefone.trim() || null,
          data_nascimento: nascimento || null,
          tipo,
        });
        toast.success("Pessoa atualizada");
      } else {
        await criarPessoa({
          sala_id: salaId,
          nome,
          telefone,
          data_nascimento: nascimento,
          tipo,
        });
        toast.success("Pessoa cadastrada");
      }
      onSalvo();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={pessoa ? "Editar pessoa" : "Nova pessoa"}
    >
      <div className="space-y-4">
        <div>
          <label className="label">Nome completo *</label>
          <input
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João da Silva"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["aluno", "🎓 Aluno"],
                ["professor", "👨‍🏫 Professor"],
                ["ambos", "🎓+👨‍🏫 Ambos"],
              ] as [TipoPessoa, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setTipo(v)}
                className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
                  tipo === v
                    ? "bg-brand-50 border-brand-500 text-brand-700"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Telefone (opcional)</label>
            <input
              className="input"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className="label">Nascimento (opcional)</label>
            <input
              type="date"
              className="input"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onFechar} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="btn-primary flex-1"
          >
            {salvando ? "Salvando..." : pessoa ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}