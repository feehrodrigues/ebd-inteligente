import { supabase } from "../supabase";
import type { Sala, TipoDivisao } from "../types";

export interface SalaConfig extends Sala {
  divisao_padrao: TipoDivisao;
  auto_renovar: boolean;
  dias_antecedencia: number;
}

export interface ResultadoRenovacao {
  criado: boolean;
  erro?: string;
  trimestre_id?: string;
  nome?: string;
  ja_existia?: boolean;
}

/** Verifica se há um período pra criar automaticamente */
export async function verificarRenovacao(
  salaId: string
): Promise<ResultadoRenovacao> {
  const { data, error } = await supabase.rpc("verificar_renovacao", {
    p_sala_id: salaId,
  });
  if (error) throw error;
  return (data as ResultadoRenovacao) ?? { criado: false };
}

/** Pega os dados completos da sala (com config) */
export async function obterSala(salaId: string): Promise<SalaConfig | null> {
  const { data, error } = await supabase
    .from("salas")
    .select("*")
    .eq("id", salaId)
    .maybeSingle();
  if (error) throw error;
  return (data as SalaConfig) ?? null;
}

/** Atualiza configurações de renovação automática */
export async function atualizarConfigRenovacao(
  salaId: string,
  config: {
    divisao_padrao: TipoDivisao;
    auto_renovar: boolean;
    dias_antecedencia: number;
  }
): Promise<void> {
  const { error } = await supabase.rpc("atualizar_config_renovacao", {
    p_sala_id: salaId,
    p_divisao: config.divisao_padrao,
    p_auto: config.auto_renovar,
    p_dias: config.dias_antecedencia,
  });
  if (error) throw error;
}