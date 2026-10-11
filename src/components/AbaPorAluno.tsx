import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import { Loading } from "./Loading";
import { Empty } from "./Empty";
import { Modal } from "./Modal";
import {
  obterRankingGeralAlunos,
  obterHistoricoAluno,
  type RankingGeralAluno,
  type HistoricoAluno,
} from "../lib/api/dashboard";
import { formatarData } from "../lib/dates";

type Ordem = "taxa" | "nome" | "faltas_consec" | "presentes";

function statusAluno(a: RankingGeralAluno): "ativo" | "atencao" | "risco" {
  if (a.faltas_consecutivas >= 3) return "risco";
  if (a.taxa_presenca < 50) return "risco";
  if (a.taxa_presenca < 75 || a.faltas_consecutivas >= 2) return "atencao";
  return "ativo";
}

const STATUS_CONFIG = {
  ativo: {
    label: "Ativo",
    cor: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  atencao: {
    label: "Atenção",
    cor: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  risco: {
    label: "Risco",
    cor: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

export function AbaPorAluno({
  trimestreId,
  turmas,
}: {
  trimestreId: string;
  turmas: { turma_id: string; turma_nome: string; turma_cor: string }[];
}) {
  const [alunos, setAlunos] = useState<RankingGeralAluno[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroTurma, setFiltroTurma] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<
    "" | "ativo" | "atencao" | "risco"
  >("");
  const [ordem, setOrdem] = useState<Ordem>("taxa");
  const [ordemAsc, setOrdemAsc] = useState(false);
  const [detalhe, setDetalhe] = useState<RankingGeralAluno | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await obterRankingGeralAlunos(trimestreId);
      setAlunos(dados);
    } catch (e: any) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [trimestreId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    let lista = [...alunos];

    if (busca) {
      const b = busca.toLowerCase();
      lista = lista.filter(
        (a) =>
          a.pessoa_nome.toLowerCase().includes(b) ||
          a.turma_nome.toLowerCase().includes(b)
      );
    }

    if (filtroTurma) {
      lista = lista.filter((a) => a.turma_id === filtroTurma);
    }

    if (filtroStatus) {
      lista = lista.filter((a) => statusAluno(a) === filtroStatus);
    }

    lista.sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      if (ordem === "nome") {
        va = a.pessoa_nome.toLowerCase();
        vb = b.pessoa_nome.toLowerCase();
      } else if (ordem === "taxa") {
        va = a.taxa_presenca;
        vb = b.taxa_presenca;
      } else if (ordem === "presentes") {
        va = a.presentes;
        vb = b.presentes;
      } else {
        va = a.faltas_consecutivas;
        vb = b.faltas_consecutivas;
      }
      if (va < vb) return ordemAsc ? -1 : 1;
      if (va > vb) return ordemAsc ? 1 : -1;
      return 0;
    });

    return lista;
  }, [alunos, busca, filtroTurma, filtroStatus, ordem, ordemAsc]);

  const estatisticas = useMemo(() => {
    const total = alunos.length;
    const ativos = alunos.filter((a) => statusAluno(a) === "ativo").length;
    const atencao = alunos.filter((a) => statusAluno(a) === "atencao").length;
    const risco = alunos.filter((a) => statusAluno(a) === "risco").length;
    const emRisco = alunos.filter((a) => a.faltas_consecutivas >= 3).length;
    return { total, ativos, atencao, risco, emRisco };
  }, [alunos]);

  function mudarOrdem(nova: Ordem) {
    if (nova === ordem) setOrdemAsc(!ordemAsc);
    else {
      setOrdem(nova);
      setOrdemAsc(false);
    }
  }

  if (carregando) return <Loading />;

  if (alunos.length === 0) {
    return (
      <div className="card">
        <Empty
          emoji="🧑‍🎓"
          titulo="Nenhum aluno matriculado"
          descricao="Adicione alunos às turmas para ver o ranking aqui."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards de status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-slate-700">
            {estatisticas.total}
          </p>
          <p className="text-xs text-slate-500">Total de alunos</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {estatisticas.ativos}
          </p>
          <p className="text-xs text-slate-500">🟢 Ativos</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {estatisticas.atencao}
          </p>
          <p className="text-xs text-slate-500">🟡 Atenção</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-2xl font-bold text-red-600">
            {estatisticas.risco}
          </p>
          <p className="text-xs text-slate-500">🔴 Risco</p>
        </div>
      </div>

      {/* Alerta de risco */}
      {estatisticas.emRisco > 0 && (
        <div className="card bg-red-50 border-red-200 flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              {estatisticas.emRisco} aluno
              {estatisticas.emRisco > 1 ? "s" : ""} com 3+ faltas seguidas
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Vale a pena entrar em contato para saber se está tudo bem.
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-9"
            placeholder="Buscar aluno ou turma..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Turma */}
          <select
            className="input py-1.5 text-sm w-auto"
            value={filtroTurma}
            onChange={(e) => setFiltroTurma(e.target.value)}
          >
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.turma_id} value={t.turma_id}>
                {t.turma_nome}
              </option>
            ))}
          </select>

          {/* Status */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(
              [
                ["", "Todos"],
                ["ativo", "🟢"],
                ["atencao", "🟡"],
                ["risco", "🔴"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFiltroStatus(v as any)}
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

      {/* Tabela */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase text-slate-500 tracking-wide bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-3 font-semibold w-8">#</th>
                <th
                  className="py-3 px-2 font-semibold cursor-pointer hover:text-brand-700"
                  onClick={() => mudarOrdem("nome")}
                >
                  <span className="flex items-center gap-1">
                    Aluno <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="py-3 px-2 font-semibold hidden md:table-cell">
                  Turma
                </th>
                <th
                  className="py-3 px-2 text-center font-semibold text-emerald-700 cursor-pointer"
                  onClick={() => mudarOrdem("presentes")}
                >
                  <span className="flex items-center gap-1 justify-center">
                    ✅ <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="py-3 px-2 text-center font-semibold text-red-700">
                  ❌
                </th>
                <th
                  className="py-3 px-2 text-center font-semibold cursor-pointer"
                  onClick={() => mudarOrdem("faltas_consec")}
                >
                  <span className="flex items-center gap-1 justify-center text-slate-600">
                    Seguidas <ArrowUpDown size={11} />
                  </span>
                </th>
                <th
                  className="py-3 px-3 text-right font-semibold cursor-pointer"
                  onClick={() => mudarOrdem("taxa")}
                >
                  <span className="flex items-center gap-1 justify-end">
                    Taxa <ArrowUpDown size={11} />
                  </span>
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a, i) => {
                const st = statusAluno(a);
                const cfg = STATUS_CONFIG[st];
                return (
                  <tr
                    key={a.pessoa_id}
                    onClick={() => setDetalhe(a)}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 text-slate-400 font-medium text-xs">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                        />
                        <span className="font-medium text-slate-800 truncate">
                          {a.pessoa_nome}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 hidden md:table-cell">
                      <span
                        className="badge text-[10px]"
                        style={{
                          backgroundColor: a.turma_cor + "20",
                          color: a.turma_cor,
                        }}
                      >
                        {a.turma_nome}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-emerald-700">
                      {a.presentes}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold text-red-700">
                      {a.faltas}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {a.faltas_consecutivas > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                            a.faltas_consecutivas >= 3
                              ? "bg-red-100 text-red-700"
                              : a.faltas_consecutivas >= 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {a.faltas_consecutivas}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                          a.taxa_presenca >= 75
                            ? "bg-emerald-50 text-emerald-700"
                            : a.taxa_presenca >= 50
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {a.taxa_presenca}%
                      </span>
                    </td>
                    <td className="pr-2">
                      <ChevronRight size={14} className="text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtrados.length === 0 && (
  <div className="p-8 text-center text-sm text-slate-500">
    Nenhum aluno encontrado com esses filtros
  </div>
)}
        </div>
      </div>

      {/* Modal de detalhes */}
      {detalhe && (
        <ModalDetalheAluno
          aluno={detalhe}
          trimestreId={trimestreId}
          onFechar={() => setDetalhe(null)}
        />
      )}
    </div>
  );
}

/* ---------- Modal de detalhes do aluno ---------- */

function ModalDetalheAluno({
  aluno,
  trimestreId,
  onFechar,
}: {
  aluno: RankingGeralAluno;
  trimestreId: string;
  onFechar: () => void;
}) {
  const [historico, setHistorico] = useState<HistoricoAluno[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const h = await obterHistoricoAluno(aluno.pessoa_id, trimestreId);
        setHistorico(h);
      } finally {
        setCarregando(false);
      }
    })();
  }, [aluno.pessoa_id, trimestreId]);

  const st = statusAluno(aluno);
  const cfg = STATUS_CONFIG[st];

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo="Detalhes do aluno"
      larguraMax="max-w-lg"
    >
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: aluno.turma_cor }}
          >
            {aluno.pessoa_nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-lg truncate">
              {aluno.pessoa_nome}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="badge text-[10px]"
                style={{
                  backgroundColor: aluno.turma_cor + "20",
                  color: aluno.turma_cor,
                }}
              >
                {aluno.turma_nome}
              </span>
              <span className={`badge text-[10px] ${cfg.cor}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-emerald-700">
              {aluno.presentes}
            </p>
            <p className="text-[10px] text-emerald-700 uppercase">Presenças</p>
          </div>
          <div className="bg-red-50 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-red-700">{aluno.faltas}</p>
            <p className="text-[10px] text-red-700 uppercase">Faltas</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2.5 text-center">
            <p className="text-xl font-bold text-amber-700">
              {aluno.justificados}
            </p>
            <p className="text-[10px] text-amber-700 uppercase">Justif.</p>
          </div>
          <div
            className={`rounded-xl p-2.5 text-center ${
              aluno.taxa_presenca >= 75
                ? "bg-emerald-50"
                : aluno.taxa_presenca >= 50
                ? "bg-amber-50"
                : "bg-red-50"
            }`}
          >
            <p
              className={`text-xl font-bold ${
                aluno.taxa_presenca >= 75
                  ? "text-emerald-700"
                  : aluno.taxa_presenca >= 50
                  ? "text-amber-700"
                  : "text-red-700"
              }`}
            >
              {aluno.taxa_presenca}%
            </p>
            <p className="text-[10px] text-slate-600 uppercase">Taxa</p>
          </div>
        </div>

        {/* Alerta de faltas seguidas */}
        {aluno.faltas_consecutivas >= 2 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {aluno.faltas_consecutivas} falta
                {aluno.faltas_consecutivas > 1 ? "s" : ""} consecutiva
                {aluno.faltas_consecutivas > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                Pode ser interessante entrar em contato.
              </p>
            </div>
          </div>
        )}

        {/* Histórico */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">
            Histórico do trimestre
          </p>

          {carregando ? (
            <Loading texto="" />
          ) : historico.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-3">
              Nenhum domingo registrado
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {historico.map((h, i) => {
                const cor =
                  h.status === "P"
                    ? "bg-emerald-100 text-emerald-700"
                    : h.status === "F"
                    ? "bg-red-100 text-red-700"
                    : h.status === "J"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-400";
                const emoji =
                  h.status === "P"
                    ? "✅"
                    : h.status === "F"
                    ? "❌"
                    : h.status === "J"
                    ? "⚠️"
                    : "—";
                const label =
                  h.status === "P"
                    ? "Presente"
                    : h.status === "F"
                    ? "Falta"
                    : h.status === "J"
                    ? "Justificado"
                    : "Sem registro";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-slate-50"
                  >
                    <span className="text-xs text-slate-500 w-20 shrink-0">
                      {formatarData(h.domingo_data)}
                    </span>
                    <span
                      className={`badge text-[10px] ${cor} flex-1 justify-start`}
                    >
                      {emoji} {label}
                    </span>
                    {h.aula_cancelada && (
                      <span className="text-[10px] text-red-500 font-semibold">
                        cancelada
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}