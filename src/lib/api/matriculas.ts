import { supabase } from "../supabase";
import type { PapelTurma } from "../types";

export interface Matriculado {
  matricula_id: string;
  pessoa_id: string;
  pessoa_nome: string;
  pessoa_tipo: string;
  papel_na_turma: PapelTurma;
  status_matricula: "ativa" | "suspensa";
  aluno_na_turma: boolean;
  professor_na_turma: boolean;
}

export async function listarMatriculados(
  turmaId: string,
  trimestreId: string
): Promise<Matriculado[]> {
  const { data, error } = await supabase.rpc("matriculados_da_turma", {
    p_turma_id: turmaId,
    p_trimestre_id: trimestreId,
  });
  if (error) throw error;
  return (data as Matriculado[]) ?? [];
}

export async function matricular(input: {
  sala_id: string;
  pessoa_id: string;
  turma_id: string;
  trimestre_id: string;
  papel_na_turma: PapelTurma;
}): Promise<void> {
  const { error } = await supabase.from("matriculas").insert({
    sala_id: input.sala_id,
    pessoa_id: input.pessoa_id,
    turma_id: input.turma_id,
    trimestre_id: input.trimestre_id,
    papel_na_turma: input.papel_na_turma,
    status: "ativa",
  });
  if (error) throw error;
}

export async function removerMatricula(id: string): Promise<void> {
  const { error } = await supabase.from("matriculas").delete().eq("id", id);
  if (error) throw error;
}

export async function suspenderMatricula(id: string): Promise<void> {
  const { error } = await supabase
    .from("matriculas")
    .update({ status: "suspensa" })
    .eq("id", id);
  if (error) throw error;
}

export async function reativarMatricula(id: string): Promise<void> {
  const { error } = await supabase
    .from("matriculas")
    .update({ status: "ativa" })
    .eq("id", id);
  if (error) throw error;
}