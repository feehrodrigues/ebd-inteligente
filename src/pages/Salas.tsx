import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import { supabase } from "../lib/supabase";
import { useSalas } from "../stores/salas";
import { setSalaAtivaId } from "../lib/sessao";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { toast } from "sonner";
import type { Sala } from "../lib/types";

export function Salas() {
  const nav = useNavigate();
  const { user } = useUser();
  const { salas, loading, carregar } = useSalas();
  const [modo, setModo] = useState<"lista" | "criar" | "entrar">("lista");

  async function entrar(salaId: string) {
    setSalaAtivaId(salaId);
    nav("/app");
  }

  if (!user) return <Loading texto="Carregando usuário..." />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-6 md:p-10">
        <div className="text-center mb-8">
          <span className="text-4xl">📖</span>
          <h1 className="text-2xl font-bold text-brand-700 mt-2">
            EBD Inteligente
          </h1>
          <p className="text-slate-500 text-sm">
            Suas salas da Escola Bíblica Dominical
          </p>
        </div>

        {modo === "lista" && (
          <>
            {loading ? (
              <Loading texto="Carregando salas..." />
            ) : salas.length === 0 ? (
              <div className="card">
                <Empty
                  emoji="🏫"
                  titulo="Você ainda não tem salas"
                  descricao="Crie uma sala nova ou entre em uma existente usando o código."
                />
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {salas.map((s: Sala) => (
                  <button
                    key={s.id}
                    onClick={() => entrar(s.id)}
                    className="card w-full text-left hover:border-brand-400 hover:shadow-md transition"
                  >
                    <p className="font-semibold text-slate-800">{s.nome}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {s.codigo_entrada}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setModo("criar")}
                className="btn-primary w-full"
              >
                ➕ Criar nova sala
              </button>
              <button
                onClick={() => setModo("entrar")}
                className="btn-secondary w-full"
              >
                🔑 Entrar com código
              </button>
            </div>
          </>
        )}

        {modo === "criar" && (
          <CriarSala
            onVoltar={() => setModo("lista")}
            onCriada={async (salaId) => {
              if (user.id) await carregar(user.id);
              setSalaAtivaId(salaId);
              nav("/app");
            }}
            userId={user.id}
            userNome={user.fullName ?? user.username ?? "Usuário"}
            userEmail={user.primaryEmailAddress?.emailAddress ?? ""}
          />
        )}

        {modo === "entrar" && (
          <EntrarSala
            onVoltar={() => setModo("lista")}
            userId={user.id}
            userNome={user.fullName ?? user.username ?? "Usuário"}
            userEmail={user.primaryEmailAddress?.emailAddress ?? ""}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- SUBCOMPONENTES ---------- */

function CriarSala({
  onVoltar,
  onCriada,
  userId,
  userNome,
  userEmail,
}: {
  onVoltar: () => void;
  onCriada: (salaId: string) => void;
  userId: string;
  userNome: string;
  userEmail: string;
}) {
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function criar() {
    if (!nome.trim()) return toast.error("Informe o nome da sala");
    setEnviando(true);
    const { data, error } = await supabase.rpc("criar_sala", {
      p_nome: nome.trim(),
      p_user_id: userId,
      p_user_nome: userNome,
      p_user_email: userEmail,
    });
    setEnviando(false);
    if (error) return toast.error(error.message);
    toast.success(`Sala "${nome}" criada!`);
    onCriada((data as any).id);
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4">Criar nova sala</h2>
      <label className="label">Nome da sala</label>
      <input
        className="input"
        placeholder="Ex: EBD Igreja Central"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        autoFocus
      />
      <p className="text-xs text-slate-500 mt-2">
        Você será o <strong>administrador</strong> desta sala.
      </p>
      <div className="flex gap-2 mt-5">
        <button onClick={onVoltar} className="btn-secondary flex-1">
          Voltar
        </button>
        <button
          onClick={criar}
          disabled={enviando}
          className="btn-primary flex-1"
        >
          {enviando ? "Criando..." : "Criar sala"}
        </button>
      </div>
    </div>
  );
}

function EntrarSala({
  onVoltar,
  userId,
  userNome,
  userEmail,
}: {
  onVoltar: () => void;
  userId: string;
  userNome: string;
  userEmail: string;
}) {
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  async function solicitar() {
    if (!codigo.trim()) return toast.error("Informe o código da sala");
    setEnviando(true);
    const { data, error } = await supabase.rpc("solicitar_entrada_sala", {
      p_codigo: codigo.trim().toUpperCase(),
      p_user_id: userId,
      p_user_nome: userNome,
      p_user_email: userEmail,
    });
    setEnviando(false);

    if (error) return toast.error(error.message);

    const r = data as any;
    if (!r.ok) {
      if (r.erro === "sala_nao_encontrada")
        return toast.error("Sala não encontrada com esse código");
      if (r.erro === "ja_membro")
        return toast.info("Você já é membro desta sala");
      if (r.erro === "ja_pendente")
        return toast.info("Você já tem uma solicitação pendente nesta sala");
      return toast.error("Erro ao solicitar entrada");
    }

    setResultado(r.sala_nome);
    toast.success("Solicitação enviada! Aguarde aprovação do admin.");
  }

  if (resultado) {
    return (
      <div className="card text-center">
        <div className="text-4xl mb-2">⏳</div>
        <h2 className="text-lg font-bold mb-1">Solicitação enviada</h2>
        <p className="text-sm text-slate-600 mb-4">
          Aguarde o administrador de <strong>{resultado}</strong> aprovar sua
          entrada.
        </p>
        <button onClick={onVoltar} className="btn-secondary">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-4">Entrar com código</h2>
      <label className="label">Código da sala</label>
      <input
        className="input uppercase tracking-widest text-center font-mono text-lg"
        placeholder="XXXXXX"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
        maxLength={6}
        autoFocus
      />
      <p className="text-xs text-slate-500 mt-2">
        Peça o código para o secretário/admin da sala.
      </p>
      <div className="flex gap-2 mt-5">
        <button onClick={onVoltar} className="btn-secondary flex-1">
          Voltar
        </button>
        <button
          onClick={solicitar}
          disabled={enviando}
          className="btn-primary flex-1"
        >
          {enviando ? "Enviando..." : "Solicitar entrada"}
        </button>
      </div>
    </div>
  );
}