import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Book, BookOpen, Plus, X, Users } from "lucide-react";
import {
  obterDadosTurmaDia,
  salvarContagem,
  adicionarVisitante,
  removerVisitante,
  type VisitanteSimples,
} from "../lib/api/turmasDia";

export function BlocoTurmaDia({
  domingoId,
  turmaId,
  presentes,
  podeEditar,
}: {
  domingoId: string;
  turmaId: string;
  presentes: number;
  podeEditar: boolean;
}) {
  const [biblias, setBiblias] = useState(0);
  const [revistas, setRevistas] = useState(0);
  const [bibliaManual, setBibliaManual] = useState(false);
  const [revistaManual, setRevistaManual] = useState(false);
  const [visitantes, setVisitantes] = useState<VisitanteSimples[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [novoVisitante, setNovoVisitante] = useState("");
  const [adicionando, setAdicionando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const d = await obterDadosTurmaDia(domingoId, turmaId);
      setBiblias(d.contagem.biblias);
      setRevistas(d.contagem.revistas);
      setBibliaManual(d.contagem.biblias_manual);
      setRevistaManual(d.contagem.revistas_manual);
      setVisitantes(d.visitantes);
      setCarregado(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  }, [domingoId, turmaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Quando muda o nº de presentes e não é manual, atualiza bíblias/revistas
  useEffect(() => {
    if (!carregado) return;
    if (!bibliaManual) setBiblias(presentes);
    if (!revistaManual) setRevistas(presentes);
  }, [presentes, carregado, bibliaManual, revistaManual]);

  async function salvar(auto = false) {
    try {
      await salvarContagem({
        domingo_id: domingoId,
        turma_id: turmaId,
        biblias,
        revistas,
        biblias_manual: bibliaManual,
        revistas_manual: revistaManual,
      });
      if (!auto) toast.success("Contagem salva");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function mudarBiblias(v: number) {
    setBiblias(v);
    setBibliaManual(true);
  }
  function mudarRevistas(v: number) {
    setRevistas(v);
    setRevistaManual(true);
  }
  function resetBiblias() {
    setBiblias(presentes);
    setBibliaManual(false);
  }
  function resetRevistas() {
    setRevistas(presentes);
    setRevistaManual(false);
  }

  async function adicionar() {
    if (!novoVisitante.trim()) return;
    setAdicionando(true);
    try {
      await adicionarVisitante({
        domingo_id: domingoId,
        turma_id: turmaId,
        nome: novoVisitante.trim(),
      });
      setNovoVisitante("");
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAdicionando(false);
    }
  }

  async function remover(id: string) {
    try {
      await removerVisitante(id);
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
      {/* Bíblias e Revistas */}
      <div className="bg-white rounded-xl p-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          📚 Bíblias e Revistas
        </p>

        <div className="space-y-2">
          {/* Bíblias */}
          <div className="flex items-center gap-2">
            <Book size={16} className="text-brand-600 shrink-0" />
            <span className="text-sm text-slate-700 flex-1">Bíblias</span>
            <button
              onClick={() => mudarBiblias(Math.max(0, biblias - 1))}
              disabled={!podeEditar}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              value={biblias}
              onChange={(e) => mudarBiblias(Number(e.target.value))}
              disabled={!podeEditar}
              className="w-14 text-center rounded-lg border border-slate-300 py-1 text-sm font-bold"
            />
            <button
              onClick={() => mudarBiblias(biblias + 1)}
              disabled={!podeEditar}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition disabled:opacity-40"
            >
              +
            </button>
            {bibliaManual && podeEditar && (
              <button
                onClick={resetBiblias}
                className="text-[10px] text-brand-600 hover:underline"
                title="Voltar a preencher com nº de presentes"
              >
                auto
              </button>
            )}
          </div>

          {/* Revistas */}
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-brand-600 shrink-0" />
            <span className="text-sm text-slate-700 flex-1">Revistas</span>
            <button
              onClick={() => mudarRevistas(Math.max(0, revistas - 1))}
              disabled={!podeEditar}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition disabled:opacity-40"
            >
              −
            </button>
            <input
              type="number"
              value={revistas}
              onChange={(e) => mudarRevistas(Number(e.target.value))}
              disabled={!podeEditar}
              className="w-14 text-center rounded-lg border border-slate-300 py-1 text-sm font-bold"
            />
            <button
              onClick={() => mudarRevistas(revistas + 1)}
              disabled={!podeEditar}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition disabled:opacity-40"
            >
              +
            </button>
            {revistaManual && podeEditar && (
              <button
                onClick={resetRevistas}
                className="text-[10px] text-brand-600 hover:underline"
              >
                auto
              </button>
            )}
          </div>
        </div>

        {podeEditar && (
          <button
            onClick={() => salvar(false)}
            className="w-full mt-3 btn-primary text-xs py-1.5"
          >
            Salvar contagem
          </button>
        )}
      </div>

      {/* Visitantes */}
      <div className="bg-white rounded-xl p-3 border border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
          <Users size={12} /> Visitantes ({visitantes.length})
        </p>

        {podeEditar && (
          <div className="flex gap-1 mb-2">
            <input
              className="input py-1.5 text-sm"
              placeholder="Nome do visitante"
              value={novoVisitante}
              onChange={(e) => setNovoVisitante(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
            />
            <button
              onClick={adicionar}
              disabled={adicionando || !novoVisitante.trim()}
              className="btn-primary px-3 text-sm"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {visitantes.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-3">
            Nenhum visitante
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {visitantes.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 rounded-full pl-2.5 pr-1 py-1 text-xs font-medium"
              >
                {v.nome}
                {podeEditar && (
                  <button
                    onClick={() => remover(v.id)}
                    className="w-4 h-4 rounded-full hover:bg-brand-200 flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}