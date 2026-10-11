import { useCallback, useEffect, useState } from "react";
import { Presentation, AlertCircle, Download } from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { usePeriodo } from "../hooks/usePeriodo";
import { Loading } from "../components/Loading";
import { Empty } from "../components/Empty";
import { SeletorDomingo } from "../components/SeletorDomingo";
import { BoletimDia } from "../components/BoletimDia";
import { ModoApresentacao } from "../components/ModoApresentacao";
import { gerarPdfRelatorio } from "../components/PdfRelatorio";
import { listarDomingosDoPeriodo, domingoPadrao } from "../lib/api/domingos";
import { obterRelatorioDia, type RelatorioDia } from "../lib/api/relatorio";
import { carregarChamada, type LinhaChamada } from "../lib/api/chamadas";
import type { Domingo } from "../lib/types";

export function Relatorio() {
  const { sala } = useSalaAtiva();
  const { periodo, carregando: carregandoPeriodo } = usePeriodo(sala?.id);

  const [domingos, setDomingos] = useState<Domingo[]>([]);
  const [domingoId, setDomingoId] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaChamada[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioDia | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [apresentando, setApresentando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!periodo) return;
    (async () => {
      const ds = await listarDomingosDoPeriodo(periodo.id);
      setDomingos(ds);
      if (!domingoId) {
        const padrao = await domingoPadrao(periodo.id);
        if (padrao) setDomingoId(padrao.id);
      }
    })();
  }, [periodo, domingoId]);

  const carregar = useCallback(async () => {
    if (!domingoId) return;
    setCarregando(true);
    setErro(null);
    try {
      const [rel, ch] = await Promise.all([
        obterRelatorioDia(domingoId),
        carregarChamada(domingoId),
      ]);
      setRelatorio(rel);
      setLinhas(ch);
    } catch (e: any) {
      setErro(e.message ?? "Erro ao carregar relatório");
    } finally {
      setCarregando(false);
    }
  }, [domingoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (!sala || carregandoPeriodo) return <Loading />;

  if (!periodo) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Relatório</h1>
        <div className="card">
          <Empty emoji="📅" titulo="Nenhum período ativo" />
        </div>
      </div>
    );
  }

  if (domingos.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Relatório</h1>
        <div className="card">
          <Empty emoji="📅" titulo="Nenhum domingo neste período" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Relatório do Dia</h1>
          <p className="text-sm text-slate-500">
            Boletim completo do domingo · pronto pra apresentar
          </p>
        </div>

        {relatorio && (
          <div className="flex gap-2">
            <button
              onClick={() => gerarPdfRelatorio(relatorio)}
              className="btn-secondary"
            >
              <Download size={16} /> Baixar PDF
            </button>
            <button
              onClick={() => setApresentando(true)}
              className="btn-primary"
            >
              <Presentation size={16} /> Apresentar
            </button>
          </div>
        )}
      </header>

      {domingoId && (
        <SeletorDomingo
          domingos={domingos}
          domingoId={domingoId}
          linhas={linhas}
          onChange={setDomingoId}
        />
      )}

      {carregando ? (
        <Loading />
      ) : erro ? (
        <div className="card bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-red-800 text-sm">
              Erro ao carregar relatório
            </p>
            <p className="text-xs text-red-700 mt-0.5">{erro}</p>
          </div>
        </div>
      ) : relatorio ? (
        <div className="card">
          <BoletimDia dados={relatorio} />
        </div>
      ) : null}

      {apresentando && relatorio && (
        <ModoApresentacao
          dados={relatorio}
          onFechar={() => setApresentando(false)}
        />
      )}
    </div>
  );
}