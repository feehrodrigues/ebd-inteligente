import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, CalendarX, Cloud } from "lucide-react";
import { listarDomingos, atualizarDomingo } from "../lib/api/trimestres";
import { formatarData, formatarDataLonga } from "../lib/dates";
import type { Domingo, Clima } from "../lib/types";
import { Loading } from "./Loading";

const CLIMA_EMOJI: Record<Clima, string> = {
  bom: "☀️",
  nublado: "☁️",
  ameacador: "🌥️",
  chuvoso: "🌧️",
  tempestuoso: "⛈️",
};

const CLIMA_LABEL: Record<Clima, string> = {
  bom: "Bom",
  nublado: "Nublado",
  ameacador: "Ameaçador",
  chuvoso: "Chuvoso",
  tempestuoso: "Tempestuoso",
};

const CLIMAS: Clima[] = ["bom", "nublado", "ameacador", "chuvoso", "tempestuoso"];

export function GerenciarDomingos({
  trimestreId,
  onAtualizou,
}: {
  trimestreId: string;
  onAtualizou?: () => void;
}) {
  const [domingos, setDomingos] = useState<Domingo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [climaAberto, setClimaAberto] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await listarDomingos(trimestreId);
      setDomingos(dados);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCarregando(false);
    }
  }, [trimestreId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function patch(id: string, p: Parameters<typeof atualizarDomingo>[1]) {
    try {
      await atualizarDomingo(id, p);
      carregar();
      onAtualizou?.();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  if (carregando) return <Loading texto="" />;

  if (domingos.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-3">
        Nenhum domingo neste período.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-slate-500 mb-2">
        {domingos.filter((d) => d.ativo && !d.aula_cancelada).length} domingos
        ativos · {domingos.length} no total
      </p>

      <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
        {domingos.map((d) => (
          <div
            key={d.id}
            className={`rounded-xl border p-3 ${
              !d.ativo
                ? "bg-slate-50 border-slate-200 opacity-60"
                : d.aula_cancelada
                ? "bg-red-50 border-red-200"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-800">
                    {formatarData(d.data)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatarDataLonga(d.data).split(",")[0]}
                  </span>

                  {!d.ativo && (
                    <span className="badge bg-slate-100 text-slate-500 text-[10px]">
                      Inativo
                    </span>
                  )}
                  {d.aula_cancelada && (
                    <span className="badge bg-red-100 text-red-700 text-[10px]">
                      <CalendarX size={10} /> Cancelada
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 shrink-0 relative">
                {/* Clima */}
                <button
                  onClick={() =>
                    setClimaAberto(climaAberto === d.id ? null : d.id)
                  }
                  className="btn-ghost p-1.5 relative"
                  title="Clima"
                >
                  {d.clima ? (
                    <span className="text-base leading-none">
                      {CLIMA_EMOJI[d.clima]}
                    </span>
                  ) : (
                    <Cloud size={14} className="text-slate-400" />
                  )}
                </button>

                {climaAberto === d.id && (
                  <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-1 flex gap-0.5">
                    {CLIMAS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          patch(d.id, { clima: c });
                          setClimaAberto(null);
                        }}
                        className={`p-1.5 rounded hover:bg-slate-100 text-base leading-none ${
                          d.clima === c ? "bg-slate-100" : ""
                        }`}
                        title={CLIMA_LABEL[c]}
                      >
                        {CLIMA_EMOJI[c]}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        patch(d.id, { clima: null });
                        setClimaAberto(null);
                      }}
                      className="p-1.5 rounded hover:bg-slate-100 text-xs text-slate-500"
                      title="Limpar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => patch(d.id, { ativo: !d.ativo })}
                  className="btn-ghost p-1.5"
                  title={d.ativo ? "Desativar" : "Reativar"}
                >
                  {d.ativo ? (
                    <X size={14} className="text-slate-400" />
                  ) : (
                    <Check size={14} className="text-emerald-500" />
                  )}
                </button>

                <button
                  onClick={() =>
                    patch(d.id, {
                      aula_cancelada: !d.aula_cancelada,
                      motivo_cancelamento: !d.aula_cancelada
                        ? d.motivo_cancelamento ?? ""
                        : null,
                    })
                  }
                  className="btn-ghost p-1.5"
                  title={d.aula_cancelada ? "Reabrir aula" : "Cancelar aula"}
                >
                  <CalendarX
                    size={14}
                    className={
                      d.aula_cancelada ? "text-red-500" : "text-slate-400"
                    }
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}