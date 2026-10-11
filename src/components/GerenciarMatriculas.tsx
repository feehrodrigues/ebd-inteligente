import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { UserPlus, Search, X, Plus, Trash2 } from "lucide-react";
import {
  listarMatriculados,
  matricular,
  removerMatricula,
  type Matriculado,
} from "../lib/api/matriculas";
import { listarPessoas, criarPessoa } from "../lib/api/pessoas";
import type { PapelTurma, Pessoa, TipoPessoa } from "../lib/types";
import { Loading } from "./Loading";

export function GerenciarMatriculas({
  turmaId,
  salaId,
  trimestreId,
  cor,
}: {
  turmaId: string;
  salaId: string;
  trimestreId: string;
  cor: string;
}) {
  const [matriculados, setMatriculados] = useState<Matriculado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [painelAdicionar, setPainelAdicionar] = useState(false);
  const [painelCriar, setPainelCriar] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await listarMatriculados(turmaId, trimestreId);
      setMatriculados(dados);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCarregando(false);
    }
  }, [turmaId, trimestreId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function remover(m: Matriculado) {
    if (
      !confirm(
        `Remover "${m.pessoa_nome}" desta turma? (o cadastro da pessoa continua)`
      )
    )
      return;
    try {
      await removerMatricula(m.matricula_id);
      toast.success("Removido da turma");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  // Agrupa matriculados por pessoa (ela pode ter aluno + professor na mesma turma)
  const agrupados = useMemo(() => {
    const mapa = new Map<
      string,
      {
        pessoa_id: string;
        pessoa_nome: string;
        pessoa_tipo: string;
        papeis: { id: string; papel: PapelTurma }[];
      }
    >();
    matriculados.forEach((m) => {
      const atual = mapa.get(m.pessoa_id) ?? {
        pessoa_id: m.pessoa_id,
        pessoa_nome: m.pessoa_nome,
        pessoa_tipo: m.pessoa_tipo,
        papeis: [],
      };
      atual.papeis.push({ id: m.matricula_id, papel: m.papel_na_turma });
      mapa.set(m.pessoa_id, atual);
    });
    return Array.from(mapa.values());
  }, [matriculados]);

  async function adicionarPapel(pessoa: Pessoa | { id: string; nome: string }, papel: PapelTurma) {
    try {
      await matricular({
        sala_id: salaId,
        pessoa_id: pessoa.id,
        turma_id: turmaId,
        trimestre_id: trimestreId,
        papel_na_turma: papel,
      });
      toast.success(`Adicionado como ${papel === "aluno" ? "aluno" : "professor"}`);
      carregar();
    } catch (e: any) {
      if (e.message?.includes("duplicate")) {
        toast.error("Essa pessoa já tem esse papel nesta turma");
      } else {
        toast.error(e.message);
      }
    }
  }

  async function criarEAdicionar(
    nome: string,
    tipo: TipoPessoa,
    papel: PapelTurma
  ) {
    try {
      const pessoa = await criarPessoa({
        sala_id: salaId,
        nome,
        tipo,
      });
      await matricular({
        sala_id: salaId,
        pessoa_id: pessoa.id,
        turma_id: turmaId,
        trimestre_id: trimestreId,
        papel_na_turma: papel,
      });
      toast.success("Pessoa criada e matriculada");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 text-sm">
          Matriculados ({agrupados.length})
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setPainelAdicionar((v) => !v);
              setPainelCriar(false);
            }}
            className="btn-secondary text-xs py-1.5 px-2.5"
          >
            <UserPlus size={14} /> Adicionar
          </button>
          <button
            type="button"
            onClick={() => {
              setPainelCriar((v) => !v);
              setPainelAdicionar(false);
            }}
            className="btn-primary text-xs py-1.5 px-2.5"
          >
            <Plus size={14} /> Nova pessoa
          </button>
        </div>
      </div>

      {painelAdicionar && (
        <PainelAdicionarExistente
          salaId={salaId}
          jaMatriculados={agrupados.map((a) => a.pessoa_id)}
          onAdicionar={adicionarPapel}
          onFechar={() => setPainelAdicionar(false)}
        />
      )}

      {painelCriar && (
        <PainelCriarNova
          onCriar={criarEAdicionar}
          onFechar={() => setPainelCriar(false)}
        />
      )}

      {carregando ? (
        <Loading texto="" />
      ) : agrupados.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          Ninguém matriculado ainda nesta turma.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {agrupados.map((a) => (
            <div
              key={a.pessoa_id}
              className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
                style={{ backgroundColor: cor }}
              >
                {a.pessoa_nome.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 truncate">
                  {a.pessoa_nome}
                </p>
                <div className="flex gap-1 mt-0.5">
                  {a.papeis.map((p) => (
                    <span
                      key={p.id}
                      className={`badge text-[10px] ${
                        p.papel === "professor"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {p.papel === "professor" ? "👨‍🏫 Professor" : "🎓 Aluno"}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  a.papeis.forEach((p) => {
                    const m = matriculados.find((x) => x.matricula_id === p.id);
                    if (m) remover(m);
                  });
                }}
                className="btn-ghost p-1.5 text-red-500"
                title="Remover da turma"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Painel: adicionar pessoas existentes ---------- */

function PainelAdicionarExistente({
  salaId,
  jaMatriculados,
  onAdicionar,
  onFechar,
}: {
  salaId: string;
  jaMatriculados: string[];
  onAdicionar: (p: Pessoa, papel: PapelTurma) => Promise<void>;
  onFechar: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [papel, setPapel] = useState<PapelTurma>("aluno");

  useEffect(() => {
    (async () => {
      try {
        const dados = await listarPessoas(salaId);
        setPessoas(dados.filter((p) => p.ativo));
      } finally {
        setCarregando(false);
      }
    })();
  }, [salaId]);

  const disponiveis = useMemo(() => {
    return pessoas
      .filter((p) => !jaMatriculados.includes(p.id))
      .filter((p) =>
        busca ? p.nome.toLowerCase().includes(busca.toLowerCase()) : true
      )
      .slice(0, 30);
  }, [pessoas, busca, jaMatriculados]);

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-brand-800">
          Adicionar pessoa existente
        </span>
        <button onClick={onFechar} className="btn-ghost p-1">
          <X size={14} />
        </button>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 w-fit">
        {(["aluno", "professor"] as PapelTurma[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPapel(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              papel === p ? "bg-brand-600 text-white" : "text-slate-600"
            }`}
          >
            {p === "aluno" ? "🎓 Aluno" : "👨‍🏫 Professor"}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          className="input pl-8 py-2 text-sm bg-white"
          placeholder="Buscar pessoa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          autoFocus
        />
      </div>

      {carregando ? (
        <p className="text-xs text-slate-500 text-center py-2">Carregando...</p>
      ) : disponiveis.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-2">
          {busca
            ? "Nenhuma pessoa encontrada"
            : "Todas as pessoas já estão nesta turma"}
        </p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {disponiveis.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onAdicionar(p, papel)}
              className="w-full text-left bg-white hover:bg-brand-100 rounded-lg px-3 py-2 text-sm transition flex items-center justify-between"
            >
              <span className="truncate">{p.nome}</span>
              <Plus size={14} className="text-brand-600 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Painel: criar pessoa nova + matricular ---------- */

function PainelCriarNova({
  onCriar,
  onFechar,
}: {
  onCriar: (nome: string, tipo: TipoPessoa, papel: PapelTurma) => Promise<void>;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<PapelTurma>("aluno");
  const [salvando, setSalvando] = useState(false);

  async function submit() {
    if (!nome.trim()) return toast.error("Informe o nome");
    setSalvando(true);
    // tipo = aluno ou professor, conforme o papel
    await onCriar(nome.trim(), papel, papel);
    setSalvando(false);
    setNome("");
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-800">
          Criar pessoa nova e matricular
        </span>
        <button onClick={onFechar} className="btn-ghost p-1">
          <X size={14} />
        </button>
      </div>

      <div className="flex gap-1 bg-white rounded-lg p-1 w-fit">
        {(["aluno", "professor"] as PapelTurma[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPapel(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              papel === p ? "bg-emerald-600 text-white" : "text-slate-600"
            }`}
          >
            {p === "aluno" ? "🎓 Aluno" : "👨‍🏫 Professor"}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input py-2 text-sm bg-white"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          autoFocus
        />
        <button
          type="button"
          onClick={submit}
          disabled={salvando}
          className="btn-primary text-sm px-4"
        >
          {salvando ? "..." : "Adicionar"}
        </button>
      </div>
      <p className="text-[11px] text-emerald-700">
        💡 A pessoa já entra no cadastro geral de Pessoas automaticamente.
      </p>
    </div>
  );
}