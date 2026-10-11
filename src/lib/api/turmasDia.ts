import { supabase } from "../supabase";

export interface VisitanteSimples {
  id: string;
  nome: string;
  observacao: string | null;
}

export interface ContagemSimples {
  biblias: number;
  revistas: number;
  biblias_manual: boolean;
  revistas_manual: boolean;
}

export interface DadosTurmaDia {
  contagem: ContagemSimples;
  visitantes: VisitanteSimples[];
  presentes: number;
}

export async function obterDadosTurmaDia(
  domingoId: string,
  turmaId: string
): Promise<DadosTurmaDia> {
  const { data, error } = await supabase.rpc("dados_turma_dia", {
    p_domingo_id: domingoId,
    p_turma_id: turmaId,
  });
  if (error) throw error;
  return data as DadosTurmaDia;
}

export async function salvarContagem(input: {
  domingo_id: string;
  turma_id: string;
  biblias: number;
  revistas: number;
  biblias_manual: boolean;
  revistas_manual: boolean;
}): Promise<void> {
  const { error } = await supabase.rpc("salvar_contagem", {
    p_domingo_id: input.domingo_id,
    p_turma_id: input.turma_id,
    p_biblias: input.biblias,
    p_revistas: input.revistas,
    p_biblias_manual: input.biblias_manual,
    p_revistas_manual: input.revistas_manual,
  });
  if (error) throw error;
}

export async function adicionarVisitante(input: {
  domingo_id: string;
  turma_id: string;
  nome: string;
}): Promise<void> {
  const { error } = await supabase.from("visitantes").insert({
    domingo_id: input.domingo_id,
    turma_id: input.turma_id,
    nome: input.nome.trim(),
  });
  if (error) throw error;
}

export async function removerVisitante(id: string): Promise<void> {
  const { error } = await supabase.from("visitantes").delete().eq("id", id);
  if (error) throw error;
}