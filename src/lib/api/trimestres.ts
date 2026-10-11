import { supabase } from "../supabase";
import type { Trimestre, Domingo, TipoDivisao, Clima } from "../types";
import { gerarDomingos } from "../dates";

export interface TrimestreComContagens extends Trimestre {
  total_domingos: number;
  total_domingos_ativos: number;
}

export async function listarTrimestres(
  salaId: string
): Promise<TrimestreComContagens[]> {
  const { data, error } = await supabase.rpc("trimestres_da_sala", {
    p_sala_id: salaId,
  });
  if (error) throw error;
  return (data as TrimestreComContagens[]) ?? [];
}

export async function criarTrimestre(input: {
  sala_id: string;
  nome: string;
  tipo_divisao: TipoDivisao;
  data_inicio: string;
  data_fim: string;
}): Promise<Trimestre> {
  // Calcula a próxima ordem dentro da sala
  const { data: ultimo } = await supabase
    .from("trimestres")
    .select("ordem")
    .eq("sala_id", input.sala_id)
    .order("ordem", { ascending: false })
    .limit(1);
  const proximaOrdem = ((ultimo?.[0]?.ordem as number) ?? 0) + 1;

  const { data, error } = await supabase
    .from("trimestres")
    .insert({
      sala_id: input.sala_id,
      nome: input.nome.trim(),
      tipo_divisao: input.tipo_divisao,
      data_inicio: input.data_inicio,
      data_fim: input.data_fim,
      ordem: proximaOrdem,
      ativo: true,                    // ← ANTES ERA false, AGORA É true
    })
    .select()
    .single();
  if (error) throw error;

  // Gera os domingos automaticamente
  const datas = gerarDomingos(input.data_inicio, input.data_fim);
  if (datas.length > 0) {
    const registros = datas.map((d) => ({
      trimestre_id: data.id,
      data: d,
      ativo: true,
    }));
    const { error: errDomingos } = await supabase
      .from("domingos")
      .insert(registros);
    if (errDomingos) throw errDomingos;
  }

  // ⬇️⬇️⬇️ AQUI VAI A CASCATA ⬇️⬇️⬇️
  // Desativa os outros períodos da sala (cascata)
  await supabase
    .from("trimestres")
    .update({ ativo: false })
    .eq("sala_id", input.sala_id)
    .neq("id", data.id);

  return data as Trimestre;
}

export async function atualizarTrimestre(
  id: string,
  patch: Partial<Pick<Trimestre, "nome" | "data_inicio" | "data_fim" | "ativo">>
): Promise<Trimestre> {
  const { data, error } = await supabase
    .from("trimestres")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Trimestre;
}

export async function ativarTrimestre(
  trimestreId: string,
  salaId: string
): Promise<void> {
  const { error } = await supabase.rpc("ativar_trimestre", {
    p_trimestre_id: trimestreId,
    p_sala_id: salaId,
  });
  if (error) throw error;
}

export async function excluirTrimestre(id: string): Promise<void> {
  const { error } = await supabase.from("trimestres").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Domingos ---------- */

export async function listarDomingos(
  trimestreId: string
): Promise<Domingo[]> {
  const { data, error } = await supabase
    .from("domingos")
    .select("*")
    .eq("trimestre_id", trimestreId)
    .order("data", { ascending: true });
  if (error) throw error;
  return (data as Domingo[]) ?? [];
}

export async function atualizarDomingo(
  id: string,
  patch: Partial<
    Pick<Domingo, "tema" | "ativo" | "aula_cancelada" | "motivo_cancelamento" | "clima" | "observacao_dia">
  >
): Promise<Domingo> {
  const { data, error } = await supabase
    .from("domingos")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Domingo;
}