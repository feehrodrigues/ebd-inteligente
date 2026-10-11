import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { toast } from "sonner";
import { Check, X, UserPlus, Shield, GraduationCap, User } from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { Modal } from "../components/Modal";
import {
  listarSolicitacoes,
  listarMembros,
  aprovarSolicitacao,
  rejeitarSolicitacao,
  removerMembro,
  type SolicitacaoPendente,
} from "../lib/api/membros";
import { listarPessoas } from "../lib/api/pessoas";
import type { SalaMembro, Pessoa } from "../lib/types";

const PAPEL_LABEL: Record<string, string> = {
  admin: "🔑 Administrador",
  professor: "👨‍🏫 Professor",
  aluno: "🎓 Aluno",
};

export function Membros() {
  const { user } = useUser();
  const { sala, papel } = useSalaAtiva();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPendente[]>([]);
  const [membros, setMembros] = useState<SalaMembro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aprovando, setAprovando] = useState<SolicitacaoPendente | null>(null);

  const ehAdmin = papel === "admin";

  const carregar = useCallback(async () => {
    if (!sala) return;
    setCarregando(true);
    try {
      const [sol, mem] = await Promise.all([
        listarSolicitacoes(sala.id),
        listarMembros(sala.id),
      ]);
      setSolicitacoes(sol);
      setMembros(mem);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCarregando(false);
    }
  }, [sala]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function rejeitar(sol: SolicitacaoPendente) {
    if (!user) return;
    if (!confirm(`Rejeitar a entrada de "${sol.user_nome ?? sol.user_email}"?`))
      return;
    try {
      await rejeitarSolicitacao(sol.id, user.id);
      toast.success("Solicitação rejeitada");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function removerMembro(m: SalaMembro) {
    if (!confirm(`Remover "${m.user_nome ?? m.user_email}" da sala?`)) return;
    try {
      await removerMembro(m.id);
      toast.success("Membro removido");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (!sala) return <Loading />;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Membros</h1>
        <p className="text-sm text-slate-500">
          Quem tem acesso à sala e quem está aguardando aprovação
        </p>
      </header>

      {carregando ? (
        <Loading />
      ) : (
        <>
          {/* Solicitações */}
          {ehAdmin && solicitacoes.length > 0 && (
            <div className="card border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="font-semibold text-amber-900">
                  {solicitacoes.length} solicitaç
                  {solicitacoes.length > 1 ? "ões" : "ão"} pendente
                  {solicitacoes.length > 1 ? "s" : ""}
                </h2>
              </div>

              <div className="space-y-2">
                {solicitacoes.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      {(s.user_nome ?? s.user_email ?? "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">
                        {s.user_nome ?? "Sem nome"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {s.user_email ?? ""}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setAprovando(s)}
                        className="btn-success text-xs py-1.5 px-3"
                      >
                        <Check size={12} /> Aprovar
                      </button>
                      <button
                        onClick={() => rejeitar(s)}
                        className="btn-ghost text-xs py-1.5 px-3 text-red-600"
                      >
                        <X size={12} /> Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Membros */}
          <div className="card">
            <h2 className="font-semibold mb-3">
              Membros ativos ({membros.length})
            </h2>

            {membros.length === 0 ? (
              <Empty emoji="👥" titulo="Nenhum membro" />
            ) : (
              <div className="space-y-1.5">
                {membros.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {m.papel === "admin" && <Shield size={16} />}
                      {m.papel === "professor" && (
                        <GraduationCap size={16} />
                      )}
                      {m.papel === "aluno" && <User size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">
                        {m.user_nome ?? "Sem nome"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {PAPEL_LABEL[m.papel]}
                      </p>
                    </div>
                    {ehAdmin && m.papel !== "admin" && (
                      <button
                        onClick={() => removerMembro(m)}
                        className="btn-ghost p-2 text-red-500"
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {aprovando && sala && user && (
        <ModalAprovar
          solicitacao={aprovando}
          salaId={sala.id}
          aprovadorId={user.id}
          onFechar={() => setAprovando(null)}
          onAprovado={() => {
            setAprovando(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}

/* ---------- Modal de aprovação ---------- */

function ModalAprovar({
  solicitacao,
  salaId,
  aprovadorId,
  onFechar,
  onAprovado,
}: {
  solicitacao: SolicitacaoPendente;
  salaId: string;
  aprovadorId: string;
  onFechar: () => void;
  onAprovado: () => void;
}) {
  const [papel, setPapel] = useState<"admin" | "professor" | "aluno">("aluno");
  const [pessoaId, setPessoaId] = useState<string | null>(null);
  const [criarNova, setCriarNova] = useState(true);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await listarPessoas(salaId);
      setPessoas(p.filter((x) => !x.user_id)); // só pessoas sem login vinculado
    })();
  }, [salaId]);

  const pessoasFiltradas = pessoas.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function aprovar() {
    setSalvando(true);
    try {
      await aprovarSolicitacao({
        solicitacaoId: solicitacao.id,
        pessoaId: criarNova ? null : pessoaId,
        papel,
        aprovadorId,
      });
      toast.success("Solicitação aprovada!");
      onAprovado();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo="Aprovar entrada na sala"
      larguraMax="max-w-lg"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-xs text-slate-500">Solicitante</p>
          <p className="font-semibold text-slate-800">
            {solicitacao.user_nome ?? "Sem nome"}
          </p>
          <p className="text-xs text-slate-500">{solicitacao.user_email}</p>
        </div>

        {/* Papel */}
        <div>
          <label className="label">Qual papel terá na sala?</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["aluno", "🎓 Aluno"],
                ["professor", "👨‍🏫 Professor"],
                ["admin", "🔑 Admin"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setPapel(v)}
                className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
                  papel === v
                    ? "bg-brand-50 border-brand-500 text-brand-700"
                    : "bg-white border-slate-300 text-slate-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Vincular ou criar pessoa */}
        <div>
          <label className="label">Já existe cadastro desta pessoa?</label>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setCriarNova(true)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                criarNova ? "bg-white shadow-sm text-brand-700" : "text-slate-600"
              }`}
            >
              Criar nova pessoa
            </button>
            <button
              type="button"
              onClick={() => setCriarNova(false)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition ${
                !criarNova ? "bg-white shadow-sm text-brand-700" : "text-slate-600"
              }`}
            >
              Vincular existente
            </button>
          </div>

          {!criarNova && (
            <div className="mt-2 space-y-2">
              <input
                className="input"
                placeholder="Buscar pessoa pelo nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {pessoasFiltradas.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">
                    Nenhuma pessoa sem login vinculado
                  </p>
                ) : (
                  pessoasFiltradas.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPessoaId(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        pessoaId === p.id
                          ? "bg-brand-100 border border-brand-500"
                          : "bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      {p.nome}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onFechar} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={aprovar}
            disabled={salvando || (!criarNova && !pessoaId)}
            className="btn-success flex-1"
          >
            {salvando ? "Aprovando..." : "Aprovar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}