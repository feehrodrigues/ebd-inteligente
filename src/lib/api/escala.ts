import { supabase } from "../supabase";

export interface LinhaEscala {
  domingo_id: string;
  domingo_data: string;
  domingo_ativo: boolean;
  domingo_cancelado: boolean;
  escala_id: string | null;
  pessoa_id: string | null;
  pessoa_nome: string | null;
  observacao: string | null;
}

export interface ProfessorSala {
  pessoa_id: string;
  pessoa_nome: string;
  pessoa_tipo: string;
}

export interface ResumoEscalaTurma {
  turma_id: string;
  turma_nome: string;
  turma_cor: string;
  turma_ordem: number;
  total_domingos: number;
  domingos_com_professor: number;
}

export async function listarEscalaDaTurma(
  turmaId: string,
  trimestreId: string
): Promise<LinhaEscala[]> {
  const { data, error } = await supabase.rpc("escala_da_turma", {
    p_turma_id: turmaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as LinhaEscala[]) ?? [];
}

export async function listarProfessoresDaSala(
  salaId: string
): Promise<ProfessorSala[]> {
  const { data, error } = await supabase.rpc("professores_da_sala", {
    p_sala_id: salaId,
  });
  if (error) throw error;
  return (data as ProfessorSala[]) ?? [];
}

export async function resumoEscalaTrimestre(
  trimestreId: string
): Promise<ResumoEscalaTurma[]> {
  const { data, error } = await supabase.rpc("resumo_escala_trimestre", {
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as ResumoEscalaTurma[]) ?? [];
}

/** Define ou troca o professor de um domingo numa turma */
export async function definirProfessor(input: {
  domingo_id: string;
  turma_id: string;
  pessoa_id: string | null; // null = remove
  observacao?: string | null;
}): Promise<void> {
  if (input.pessoa_id === null) {
    const { error } = await supabase
      .from("escala")
      .delete()
      .eq("domingo_id", input.domingo_id)
      .eq("turma_id", input.turma_id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("escala").upsert(
    {
      domingo_id: input.domingo_id,
      turma_id: input.turma_id,
      pessoa_id: input.pessoa_id,
      observacao: input.observacao ?? null,
    },
    { onConflict: "domingo_id,turma_id" }
  );
  if (error) throw error;
}