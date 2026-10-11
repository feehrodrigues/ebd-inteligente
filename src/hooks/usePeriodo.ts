import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Trimestre } from "../lib/types";
import {
  getPeriodoSelecionadoId,
  setPeriodoSelecionadoId,
  limparPeriodoSelecionado,
} from "../lib/sessao";

export function usePeriodo(salaId: string | undefined) {
  const [periodo, setPeriodo] = useState<Trimestre | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [periodos, setPeriodos] = useState<Trimestre[]>([]);

  const carregar = useCallback(async () => {
    if (!salaId) {
      setPeriodo(null);
      setPeriodos([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);

    // Carrega a lista completa de períodos dessa sala
    const { data: lista, error: errLista } = await supabase
      .from("trimestres")
      .select("*")
      .eq("sala_id", salaId)
      .order("ordem", { ascending: false });

    if (errLista) {
      console.error(errLista);
      setCarregando(false);
      return;
    }

    const todos = (lista as Trimestre[]) ?? [];
    setPeriodos(todos);

    // Decide qual período exibir
    const salvoId = getPeriodoSelecionadoId(salaId);
    let alvo = todos.find((t) => t.id === salvoId) ?? null;

    // Se o salvo não existe mais, busca o padrão do banco
    if (!alvo) {
      const { data: padrao } = await supabase.rpc("trimestre_padrao", {
        p_sala_id: salaId,
      });
      alvo = (padrao as Trimestre) ?? todos[0] ?? null;
    }

    if (alvo) {
      setPeriodo(alvo);
      setPeriodoSelecionadoId(salaId, alvo.id);
    } else {
      setPeriodo(null);
    }

    setCarregando(false);
  }, [salaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function selecionar(trimestreId: string) {
    if (!salaId) return;
    const alvo = periodos.find((p) => p.id === trimestreId);
    if (!alvo) return;
    setPeriodo(alvo);
    setPeriodoSelecionadoId(salaId, trimestreId);
  }

  function resetarSelecao() {
    if (!salaId) return;
    limparPeriodoSelecionado(salaId);
    carregar();
  }

  return {
    periodo,
    periodos,
    carregando,
    selecionar,
    resetarSelecao,
    recarregar: carregar,
  };
}