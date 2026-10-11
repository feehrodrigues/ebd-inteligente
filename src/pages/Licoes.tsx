import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Check,
  Pencil,
  X,
  Search,
  CalendarX,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { listarLicoesDaTurma, salvarLicao, type LicaoTurma } from "../lib/api/licoes";
import { listarTurmas, type TurmaComContagens } from "../lib/api/turmas";
import { formatarData, formatarDataLonga } from "../lib/dates";
import type { Clima } from "../lib/types";

const CLIMA_EMOJI: Record<Clima, string> = {
  bom: "☀️",
  nublado: "☁️",
  ameacador: "🌥️",
  chuvoso: "🌧️",
  tempestuoso: "⛈️",
};

export function Licoes() {
  const { sala, papel } = useSalaAtiva();
  const { periodo: trimestre, carregando: carregandoTri } = usePeriodo(sala?.id);

  const [turmas, setTurmas] = useState<TurmaComContagens[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null);
  const [licoes, setLicoes] = useState<LicaoTurma[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [temaTemp, setTemaTemp] = useState("");

  const podeEditar = papel === "admin" || papel === "professor";

  // Carrega turmas
  useEffect(() => {
    if (!sala || !trimestre) return;
    (async () => {
      const ts = await listarTurmas(sala.id, trimestre.id);
      const ativas = ts.filter((t) => t.ativa);
      setTurmas(ativas);
      if (!turmaSelecionada && ativas.length > 0) {
        setTurmaSelecionada(ativas[0].id);
      }
    })();
  }, [sala, trimestre, turmaSelecionada]);

  // Carrega lições da turma selecionada
  const carregarLicoes = useCallback(async () => {
    if (!turmaSelecionada || !trimestre) return;
    setCarregando(true);
    try {
      const dados = await listarLicoesDaTurma(turmaSelecionada, trimestre.id);
      setLicoes(dados);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCarregando(false);
    }
  }, [turmaSelecionada, trimestre]);

  useEffect(() => {
    carregarLicoes();
  }, [carregarLicoes]);

  const turma = useMemo(
    () => turmas.find((t) => t.id === turmaSelecionada),
    [turmas, turmaSelecionada]
  );

  const estatisticas = useMemo(() => {
    const comTema = licoes.filter((l) => l.tema && l.domingo_ativo && !l.domingo_cancelado).length;
    const ativos = licoes.filter((l) => l.domingo_ativo && !l.domingo_cancelado).length;
    return { comTema, ativos };
  }, [licoes]);

  const filtradas = useMemo(() => {
    if (!busca) return licoes;
    return licoes.filter((l) =>
      l.tema?.toLowerCase().includes(busca.toLowerCase())
    );
  }, [licoes, busca]);

  async function salvar(domingoId: string) {
    if (!turmaSelecionada) return;
    try {
      await salvarLicao({
        domingo_id: domingoId,
        turma_id: turmaSelecionada,
        tema: temaTemp,
      });
      toast.success(temaTemp.trim() ? "Lição salva" : "Lição removida");
      setEditando(null);
      carregarLicoes();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  function abrirEdicao(l: LicaoTurma) {
    setEditando(l.domingo_id);
    setTemaTemp(l.tema ?? "");
  }

  if (!sala) return <Loading />;
  if (carregandoTri) return <Loading />;

  if (!trimestre) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Lições</h1>
        <div className="card">
          <Empty
            emoji="📅"
            titulo="Nenhum trimestre ativo"
            descricao="Ative um trimestre em 'Trimestres' para registrar as lições por turma."
          />
        </div>
      </div>
    );
  }

  if (turmas.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Lições</h1>
        <div className="card">
          <Empty
            emoji="🎓"
            titulo="Nenhuma turma criada"
            descricao="Crie turmas em 'Turmas' antes de registrar as lições."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Lições</h1>
        <p className="text-sm text-slate-500">
          Cada turma tem o seu tema de lição por domingo
        </p>
      </header>

      {/* Seletor de turma */}
      <div className="flex flex-wrap gap-2">
        {turmas.map((t) => (
          <button
            key={t.id}
            onClick={() => setTurmaSelecionada(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
              turmaSelecionada === t.id
                ? "text-white border-transparent shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            style={
              turmaSelecionada === t.id
                ? { backgroundColor: t.cor }
                : undefined
            }
          >
            {t.nome}
          </button>
        ))}
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
              {turma.faixa && (
                <span className="text-xs text-slate-500">· {turma.faixa}</span>
              )}
            </div>
            <span className="text-sm text-slate-600 font-medium">
              {estatisticas.comTema} de {estatisticas.ativos}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all rounded-full"
              style={{
                width: `${
                  estatisticas.ativos > 0
                    ? (estatisticas.comTema / estatisticas.ativos) * 100
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
          placeholder="Buscar lição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Lista */}
      {carregando ? (
        <Loading />
      ) : filtradas.length === 0 ? (
        <div className="card">
          <Empty
            emoji="📖"
            titulo={busca ? "Nenhum resultado" : "Nenhum domingo neste trimestre"}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((l) => {
            const desabilitado = !l.domingo_ativo || l.domingo_cancelado;
            const editandoEste = editando === l.domingo_id;

            return (
              <div
                key={l.domingo_id}
                className={`card py-3 ${desabilitado ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 shrink-0 text-center">
                    <p className="font-bold text-sm text-slate-800">
                      {formatarData(l.domingo_data)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formatarDataLonga(l.domingo_data).split(",")[0]}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    {editandoEste ? (
                      <div className="flex gap-1">
                        <input
                          className="input py-1.5 text-sm"
                          value={temaTemp}
                          onChange={(e) => setTemaTemp(e.target.value)}
                          placeholder="Ex: Lição 3 - A Fé de Abraão"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") salvar(l.domingo_id);
                            if (e.key === "Escape") setEditando(null);
                          }}
                        />
                        <button
                          onClick={() => salvar(l.domingo_id)}
                          className="btn-primary text-xs px-2.5"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditando(null)}
                          className="btn-secondary text-xs px-2.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => podeEditar && abrirEdicao(l)}
                        disabled={!podeEditar}
                        className="text-left w-full group"
                      >
                        {l.tema ? (
                          <p className="text-sm text-slate-700 font-medium flex items-center gap-1.5">
                            <BookOpen size={14} className="text-slate-400" />
                            {l.tema}
                            {podeEditar && (
                              <Pencil
                                size={11}
                                className="text-slate-300 opacity-0 group-hover:opacity-100 transition"
                              />
                            )}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 italic flex items-center gap-1.5">
                            <BookOpen size={14} />
                            Adicionar tema da lição...
                          </p>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {l.domingo_clima && (
                      <span title={l.domingo_clima} className="text-base">
                        {CLIMA_EMOJI[l.domingo_clima as Clima] ?? ""}
                      </span>
                    )}
                    {l.domingo_cancelado && (
                      <CalendarX size={14} className="text-red-500" />
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