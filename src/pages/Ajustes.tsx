import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Sparkles, CalendarDays } from "lucide-react";
import { useSalaAtiva } from "../hooks/useSalaAtiva";
import { Loading } from "../components/Loading";
import {
  obterSala,
  atualizarConfigRenovacao,
  type SalaConfig,
} from "../lib/api/salas";
import type { TipoDivisao } from "../lib/types";

const TIPO_LABEL: Record<TipoDivisao, string> = {
  bimestre: "Bimestre (6x no ano)",
  trimestre: "Trimestre (4x no ano)",
  semestre: "Semestre (2x no ano)",
  ano: "Ano inteiro (1x no ano)",
  custom: "Personalizado",
};

export function Ajustes() {
  const { sala, papel } = useSalaAtiva();
  const [config, setConfig] = useState<SalaConfig | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const podeEditar = papel === "admin";

  useEffect(() => {
    if (!sala) return;
    (async () => {
      try {
        const s = await obterSala(sala.id);
        setConfig(s);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, [sala]);

  async function salvar() {
    if (!sala || !config) return;
    setSalvando(true);
    try {
      await atualizarConfigRenovacao(sala.id, {
        divisao_padrao: config.divisao_padrao,
        auto_renovar: config.auto_renovar,
        dias_antecedencia: config.dias_antecedencia,
      });
      toast.success("Configurações salvas");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!sala) return <Loading />;
  if (carregando || !config) return <Loading />;

  const ehAno = config.divisao_padrao === "ano";

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold">Ajustes da sala</h1>
        <p className="text-sm text-slate-500">{sala.nome}</p>
      </header>

      <div className="card">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-brand-600" />
          Divisão do tempo
        </h2>

        <label className="label">Como o tempo é dividido nesta sala?</label>
        <select
          className="input"
          value={config.divisao_padrao}
          onChange={(e) =>
            setConfig({ ...config, divisao_padrao: e.target.value as TipoDivisao })
          }
          disabled={!podeEditar}
        >
          <option value="trimestre">Trimestre (4x no ano)</option>
          <option value="bimestre">Bimestre (6x no ano)</option>
          <option value="semestre">Semestre (2x no ano)</option>
          <option value="ano">Ano inteiro (1x no ano)</option>
        </select>

        <p className="text-xs text-slate-500 mt-2">
          A divisão padrão é usada ao criar novos períodos automaticamente.
        </p>
      </div>

      <div className="card">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-violet-600" />
          Renovação automática
        </h2>

        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <div>
            <p className="font-medium text-slate-700 text-sm">
              Criar o próximo período sozinho
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Quando o período atual está acabando, o próximo é criado
              automaticamente com os domingos gerados.
            </p>
          </div>
          <input
            type="checkbox"
            className="w-5 h-5 accent-brand-600 cursor-pointer shrink-0"
            checked={config.auto_renovar}
            onChange={(e) =>
              setConfig({ ...config, auto_renovar: e.target.checked })
            }
            disabled={!podeEditar || ehAno}
          />
        </label>

        {config.auto_renovar && !ehAno && (
          <div className="mt-4">
            <label className="label">Antecedência pra criar o próximo</label>
            <select
              className="input"
              value={config.dias_antecedencia}
              onChange={(e) =>
                setConfig({
                  ...config,
                  dias_antecedencia: Number(e.target.value),
                })
              }
              disabled={!podeEditar}
            >
              <option value={3}>3 dias antes do fim</option>
              <option value={7}>7 dias antes do fim (padrão)</option>
              <option value={14}>14 dias antes do fim</option>
              <option value={30}>30 dias antes do fim</option>
            </select>
          </div>
        )}

        {ehAno && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 mt-3">
            💡 Renovação automática não se aplica quando a divisão é o ano
            inteiro.
          </p>
        )}
      </div>

      {podeEditar && (
        <button
          onClick={salvar}
          disabled={salvando}
          className="btn-primary w-full"
        >
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar ajustes"}
        </button>
      )}

      {!podeEditar && (
        <p className="text-xs text-slate-500 text-center">
          Só administradores podem alterar as configurações.
        </p>
      )}
    </div>
  );
}