import { supabase } from "../supabase";
import type { StatusPresenca } from "../types";

export interface LinhaChamada {
  turma_id: string;
  turma_nome: string;
  turma_faixa: string | null;
  turma_cor: string;
  turma_ordem: number;
  matricula_id: string;
  pessoa_id: string;
  pessoa_nome: string;
  pessoa_tipo: string;
  papel_na_turma: "aluno" | "professor";
  matricula_status: "ativa" | "suspensa";
  presenca_id: string | null;
  presenca_status: StatusPresenca | null;
  presenca_observacao: string | null;
}

export interface ResumoDia {
  total_matriculados: number;
  presentes: number;
  faltas: number;
  justificados: number;
  visitantes: number;
  biblias: number;
  revistas: number;
  taxa_presenca: number;
  taxa_anterior: number | null;
  presentes_anterior: number | null;
  tem_anterior: boolean;
}

export async function carregarChamada(domingoId: string): Promise<LinhaChamada[]> {
  const { data, error } = await supabase.rpc("chamada_do_domingo", {
    p_domingo_id: domingoId,
  });
  if (error) throw error;
  return (data as LinhaChamada[]) ?? [];
}

export async function salvarPresenca(input: {
  domingo_id: string;
  pessoa_id: string;
  turma_id: string;
  status: StatusPresenca | null;
  user_id: string;
}): Promise<void> {
  if (input.status === null) {
    const { error } = await supabase
      .from("presencas")
      .delete()
      .eq("domingo_id", input.domingo_id)
      .eq("pessoa_id", input.pessoa_id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("presencas").upsert(
    {
      domingo_id: input.domingo_id,
      pessoa_id: input.pessoa_id,
      turma_id: input.turma_id,
      status: input.status,
      registrado_por: input.user_id,
      registrado_em: new Date().toISOString(),
    },
    { onConflict: "domingo_id,pessoa_id" }
  );
  if (error) throw error;
}

export async function marcarTurmaPresente(
  domingoId: string,
  turmaId: string,
  userId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("marcar_turma_presente", {
    p_domingo_id: domingoId,
    p_turma_id: turmaId,
    p_user_id: userId,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function limparTurmaChamada(
  domingoId: string,
  turmaId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("limpar_turma_chamada", {
    p_domingo_id: domingoId,
    p_turma_id: turmaId,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function resumoDia(domingoId: string): Promise<ResumoDia> {
  const { data, error } = await supabase.rpc("resumo_dia", {
    p_domingo_id: domingoId,
  });
  if (error) throw error;
  return data as ResumoDia;
}