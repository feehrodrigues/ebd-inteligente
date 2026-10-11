import { setPeriodoSelecionadoId } from "../lib/sessao";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  CalendarDays,
  Pencil,
  Power,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { Modal } from "../components/Modal";
import {
  listarTrimestres,
  criarTrimestre,
  ativarTrimestre,
  excluirTrimestre,
  type TrimestreComContagens,
} from "../lib/api/trimestres";
import { formatarData } from "../lib/dates";
import type { TipoDivisao } from "../lib/types";
import { GerenciarDomingos } from "../components/GerenciarDomingos";

const TIPO_LABEL: Record<TipoDivisao, string> = {
  bimestre: "Bimestre",
  trimestre: "Trimestre",
  semestre: "Semestre",
  ano: "Ano",
  custom: "Personalizado",
};

export function Trimestres() {
  const { sala, papel } = useSalaAtiva();
  const [trimestres, setTrimestres] = useState<TrimestreComContagens[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  const [modalAberto, setModalAberto] = useState(false);

  const podeEditar = papel === "admin";

  const carregar = useCallback(async () => {
    if (!sala) return;
    setCarregando(true);
    try {
      const dados = await listarTrimestres(sala.id);
      setTrimestres(dados);
      // Auto-expande o trimestre ativo, se existir
      const ativo = dados.find((t) => t.ativo);
      if (ativo && !expandido) setExpandido(ativo.id);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao carregar trimestres");
    } finally {
      setCarregando(false);
    }
  }, [sala, expandido]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function ativar(t: TrimestreComContagens) {
    if (!sala) return;
    if (
      !confirm(
        `Ativar "${t.nome}"? O trimestre atualmente ativo será desativado.`
      )
    )
      return;
    try {
      await ativarTrimestre(t.id, sala.id);
      toast.success(`"${t.nome}" agora é o trimestre ativo`);
      carregar();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function excluir(t: TrimestreComContagens) {
    if (
      !confirm(
        `Excluir "${t.nome}"? Isso apaga TODOS os domingos e presenças vinculadas. Essa ação não pode ser desfeita.`
      )
    )
      return;
    try {
      await excluirTrimestre(t.id);
      toast.success("Trimestre excluído");
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
          <h1 className="text-2xl font-bold">Trimestres</h1>
          <p className="text-sm text-slate-500">
            Cada trimestre tem seus domingos e é compartilhado por todas as
            turmas
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => setModalAberto(true)}
            className="btn-primary"
          >
            <Plus size={18} /> Novo período
          </button>
        )}
      </header>

      {carregando ? (
        <Loading />
      ) : trimestres.length === 0 ? (
        <div className="card">
          <Empty
            emoji="📅"
            titulo="Nenhum trimestre cadastrado"
            descricao="Crie o primeiro período (geralmente um trimestre) para começar a montar suas turmas e fazer chamadas."
            acao={
              podeEditar ? (
                <button
                  onClick={() => setModalAberto(true)}
                  className="btn-primary"
                >
                  <Plus size={18} /> Criar primeiro período
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {trimestres.map((t) => {
            const aberto = expandido === t.id;
            return (
              <div
                key={t.id}
                className={`card ${!t.ativo ? "opacity-90" : ""}`}
              >
                <div className="flex flex-wrap items-start gap-3">
                  <button
                    onClick={() => setExpandido(aberto ? null : t.id)}
                    className="btn-ghost p-1 shrink-0"
                  >
                    {aberto ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800">{t.nome}</h3>
                      {t.ativo && (
                        <span className="badge bg-emerald-100 text-emerald-700">
                          ● Ativo
                        </span>
                      )}
                      <span className="badge bg-slate-100 text-slate-600">
                        {TIPO_LABEL[t.tipo_divisao]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        {formatarData(t.data_inicio)} →{" "}
                        {formatarData(t.data_fim)}
                      </span>
                      <span>
                        {t.total_domingos_ativos} domingo
                        {t.total_domingos_ativos !== 1 ? "s" : ""} ativo
                        {t.total_domingos_ativos !== 1 ? "s" : ""}
                        {t.total_domingos !== t.total_domingos_ativos &&
                          ` (${t.total_domingos} no total)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {podeEditar && !t.ativo && (
                      <button
  onClick={() => {
    // Navega pro período clicado
    setPeriodoSelecionadoId(sala!.id, t.id);
    window.location.reload();
  }}
  className="btn-ghost p-2"
  title="Ir para este período"
>
  <Power size={16} className={t.ativo ? "text-emerald-500" : "text-slate-400"} />
</button>
                    )}
                    {podeEditar && !t.ativo && (
                      <button
                        onClick={() => excluir(t)}
                        className="btn-ghost p-2"
                        title="Excluir"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                {aberto && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <GerenciarDomingos
                      trimestreId={t.id}
                      onAtualizou={carregar}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sala && (
        <ModalTrimestre
          aberto={modalAberto}
          onFechar={() => setModalAberto(false)}
          salaId={sala.id}
          onSalvo={() => {
            setModalAberto(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}

/* ---------- Modal de criação ---------- */

function ModalTrimestre({
  aberto,
  onFechar,
  salaId,
  onSalvo,
}: {
  aberto: boolean;
  onFechar: () => void;
  salaId: string;
  onSalvo: () => void;
}) {
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(anoAtual);
  const [tipo, setTipo] = useState<TipoDivisao>("trimestre");
  const [indice, setIndice] = useState(1);
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Sugestões conforme o tipo escolhido
  const sugestoes = useMemo(() => {
    const map: Record<
      Exclude<TipoDivisao, "custom">,
      { nome: string; ini: string; fim: string }[]
    > = {
      trimestre: [
        { nome: `1º Trimestre ${ano}`, ini: `${ano}-01-01`, fim: `${ano}-03-31` },
        { nome: `2º Trimestre ${ano}`, ini: `${ano}-04-01`, fim: `${ano}-06-30` },
        { nome: `3º Trimestre ${ano}`, ini: `${ano}-07-01`, fim: `${ano}-09-30` },
        { nome: `4º Trimestre ${ano}`, ini: `${ano}-10-01`, fim: `${ano}-12-31` },
      ],
      bimestre: [
        { nome: `1º Bimestre ${ano}`, ini: `${ano}-01-01`, fim: `${ano}-02-28` },
        { nome: `2º Bimestre ${ano}`, ini: `${ano}-03-01`, fim: `${ano}-04-30` },
        { nome: `3º Bimestre ${ano}`, ini: `${ano}-05-01`, fim: `${ano}-06-30` },
        { nome: `4º Bimestre ${ano}`, ini: `${ano}-07-01`, fim: `${ano}-08-31` },
        { nome: `5º Bimestre ${ano}`, ini: `${ano}-09-01`, fim: `${ano}-10-31` },
        { nome: `6º Bimestre ${ano}`, ini: `${ano}-11-01`, fim: `${ano}-12-31` },
      ],
      semestre: [
        { nome: `1º Semestre ${ano}`, ini: `${ano}-01-01`, fim: `${ano}-06-30` },
        { nome: `2º Semestre ${ano}`, ini: `${ano}-07-01`, fim: `${ano}-12-31` },
      ],
      ano: [{ nome: `Ano ${ano}`, ini: `${ano}-01-01`, fim: `${ano}-12-31` }],
    };
    return map[tipo as Exclude<TipoDivisao, "custom">];
  }, [tipo, ano]);

  // Aplica sugestão quando muda tipo/índice/ano
  useEffect(() => {
    if (tipo === "custom") return;
    const s = sugestoes[indice - 1];
    if (s) {
      setNome(s.nome);
      setDataInicio(s.ini);
      setDataFim(s.fim);
    }
  }, [tipo, indice, ano, sugestoes]);

  // Reseta índice ao mudar tipo
  useEffect(() => {
    setIndice(1);
  }, [tipo, ano]);

  async function salvar() {
    if (!nome.trim()) return toast.error("Informe o nome");
    if (!dataInicio || !dataFim) return toast.error("Informe as datas");
    if (dataFim < dataInicio) return toast.error("Data fim anterior ao início");

    setSalvando(true);
    try {
      const t = await criarTrimestre({
        sala_id: salaId,
        nome,
        tipo_divisao: tipo,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });
      toast.success(
        `"${t.nome}" criado! Domingos gerados automaticamente. Ative-o pra usar.`
      );
      onSalvo();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Novo período"
      larguraMax="max-w-lg"
    >
      <div className="space-y-4">
        <div>
          <label className="label">Ano</label>
          <input
            type="number"
            className="input"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label">Tipo de divisão</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["trimestre", "Trimestre"],
                ["bimestre", "Bimestre"],
                ["semestre", "Semestre"],
                ["ano", "Ano"],
                ["custom", "Customizado"],
              ] as [TipoDivisao, string][]
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setTipo(v)}
                className={`rounded-xl px-3 py-2 text-sm font-medium border transition ${
                  tipo === v
                    ? "bg-brand-50 border-brand-500 text-brand-700"
                    : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                } ${v === "custom" ? "col-span-2" : ""}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {tipo !== "custom" && sugestoes.length > 1 && (
          <div>
            <label className="label">Qual período?</label>
            <div className="flex flex-wrap gap-1.5">
              {sugestoes.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndice(i + 1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    indice === i + 1
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}º
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label">Nome do período *</label>
          <input
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: 4º Trimestre 2025"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Início *</label>
            <input
              type="date"
              className="input"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Fim *</label>
            <input
              type="date"
              className="input"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5">
          💡 Os domingos entre início e fim serão gerados automaticamente. Você
          poderá editar tema, desativar ou cancelar cada um depois.
        </p>

        <div className="flex gap-2 pt-2">
          <button onClick={onFechar} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={salvando}
            className="btn-primary flex-1"
          >
            {salvando ? "Criando..." : "Criar período"}
          </button>
        </div>
      </div>
    </Modal>
  );
}